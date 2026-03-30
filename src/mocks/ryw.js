/**
 * Read-your-writes: mutate the in-memory mock DB on writes so the next GET
 * returns consistent data (MSW demo parity with a real API).
 */
import { db } from "./db/index.js";

export const todayISO = () => new Date().toISOString().split("T")[0];

export function cfKey(portfolioId, shiftId, date) {
  return `${portfolioId}_${shiftId}_${date}`;
}

function nextNumericKey(bucket) {
  const keys = Object.keys(bucket || {}).map(Number).filter((n) => !Number.isNaN(n));
  return keys.length === 0 ? 1 : Math.max(...keys) + 1;
}

async function parseJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export { parseJson };

/** --- Meter / sales units --- */

export function applyBulkMeterUpsert(readings) {
  if (!Array.isArray(readings)) return;
  for (const row of readings) {
    mergeOneMeterRow(row);
  }
}

export function mergeOneMeterRow(row) {
  const pid = row.portfolio_id;
  const sid = row.shift_id;
  const date = row.date || todayISO();
  if (pid == null || sid == null) return;
  const key = cfKey(pid, sid, date);
  if (!db.meterByKey[key]) db.meterByKey[key] = {};
  const bucket = db.meterByKey[key];
  let id = row.id;
  if (id == null || id === "" || (typeof id === "string" && id.startsWith("temp-"))) {
    id = nextNumericKey(bucket);
  }
  const idx = String(id);
  const existing = bucket[idx] || {};
  const closingNum =
    row.closing_reading != null && row.closing_reading !== ""
      ? Number(row.closing_reading)
      : null;
  const discontinued =
    row.discontinued != null
      ? Boolean(row.discontinued)
      : row.status === "Discontinued" ||
        existing.status === "Discontinued" ||
        existing.discontinued === true;
  bucket[idx] = {
    ...existing,
    ...row,
    id: Number(id),
    meter_reading:
      closingNum != null && !Number.isNaN(closingNum)
        ? closingNum
        : row.meter_reading ?? existing.meter_reading,
    product_name:
      row.product_name ??
      existing.product_name ??
      (row.product_id
        ? `SKU-${String(row.product_id).padStart(3, "0")} Premium`
        : existing.product_name),
    discontinued,
  };
}

export function deleteMeterReadingById(id) {
  const sid = String(id);
  for (const key of Object.keys(db.meterByKey)) {
    const bucket = db.meterByKey[key];
    for (const k of Object.keys(bucket)) {
      if (String(bucket[k].id) === sid) {
        delete bucket[k];
        return true;
      }
    }
  }
  return false;
}

function forEachMeterEntry(fn) {
  for (const key of Object.keys(db.meterByKey)) {
    const bucket = db.meterByKey[key];
    for (const k of Object.keys(bucket)) {
      if (fn(bucket[k], bucket, k) === true) return true;
    }
  }
  return false;
}

export function applyMeterChangeStatus(body) {
  if (body.id != null) {
    const found = forEachMeterEntry((row, bucket, k) => {
      if (String(row.id) !== String(body.id)) return;
      const next =
        body.status ??
        (row.status === "Active" ? "Discontinued" : "Active");
      const discontinued = next === "Discontinued";
      bucket[k] = { ...row, status: next, discontinued };
      return true;
    });
    if (found) return;
  }
  if (body.sales_unit_name) {
    forEachMeterEntry((row, bucket, k) => {
      if (row.sales_unit_name !== body.sales_unit_name) return;
      const next = body.status ?? row.status;
      const discontinued = next === "Discontinued";
      bucket[k] = { ...row, status: next, discontinued };
      return true;
    });
  }
}

/** --- Cashflow (per portfolio/shift/date bucket) --- */

function applyGlobalCashflowRow(row) {
  if (!db.globalEntries) db.globalEntries = {};
  let id = row.id;
  if (id == null || id === "" || (typeof id === "string" && id.startsWith("temp-"))) {
    id = nextNumericKey(db.globalEntries);
  }
  const idx = String(id);
  const merged = {
    ...db.globalEntries[idx],
    ...row,
    id: Number(id),
    date: row.date || todayISO(),
    type: row.type || "expense",
    amount: Number(row.amount) || 0,
    mode: row.mode || "Cash",
    category: row.category ?? "",
    description: row.description ?? "",
  };
  delete merged.portfolio_id;
  delete merged.shift_id;
  db.globalEntries[idx] = merged;
}

function bankNameForMode(modeName) {
  const m = (db.modes || []).find((x) => x.mode_name === modeName);
  const fallback = db.bankAccounts?.[0]?.bank_name ?? "Demo National Bank";
  if (!m) return fallback;
  const bank = (db.bankAccounts || []).find((b) => b.id === m.associated_account);
  return bank?.bank_name ?? fallback;
}

function findPortfolioShiftNames(portfolioId, shiftId, dateStr) {
  const snap = db.portfolioByDate?.[dateStr] || db.portfolioByDate?.[todayISO()] || {};
  const row = Object.values(snap).find(
    (p) =>
      Number(p.portfolio_id) === Number(portfolioId) &&
      Number(p.shift_id) === Number(shiftId)
  );
  const shiftRow = db.shiftConfigRows?.[String(shiftId)];
  return {
    portfolio_name:
      row?.portfolio_name ?? shiftRow?.portfolio_name ?? `Island ${portfolioId}`,
    shift_name: row?.shift_name ?? shiftRow?.shift_name ?? `Shift ${shiftId}`,
  };
}

function parseCfKey(key) {
  const parts = key.split("_");
  if (parts.length < 3) return null;
  const dateStr = parts[parts.length - 1];
  const shiftId = Number(parts[parts.length - 2]);
  const portfolioId = Number(parts.slice(0, -2).join("_"));
  if (Number.isNaN(portfolioId) || Number.isNaN(shiftId)) return null;
  return { portfolioId, shiftId, dateStr };
}

/** Transaction ledger + summary for Cashflow page (island rows + global entries). */
export function buildTransactionLedgerResponse(filters) {
  const {
    startDate = null,
    endDate = null,
    portfolioId = null,
    shiftId = null,
    mode = null,
    type = null,
  } = filters || {};

  const rows = [];

  for (const key of Object.keys(db.cashflowByKey || {})) {
    const parsed = parseCfKey(key);
    if (!parsed) continue;
    const { portfolioId: pid, shiftId: sid, dateStr: dateFromKey } = parsed;

    if (startDate && dateFromKey < startDate) continue;
    if (endDate && dateFromKey > endDate) continue;
    if (portfolioId != null && portfolioId !== "" && String(portfolioId) !== "null") {
      if (Number(portfolioId) !== Number(pid)) continue;
    }
    if (shiftId != null && shiftId !== "" && String(shiftId) !== "null") {
      if (Number(shiftId) !== Number(sid)) continue;
    }

    const { portfolio_name, shift_name } = findPortfolioShiftNames(pid, sid, dateFromKey);
    const bucket = db.cashflowByKey[key];
    for (const row of Object.values(bucket || {})) {
      const rowDateFinal = row.date || dateFromKey;
      if (startDate && rowDateFinal < startDate) continue;
      if (endDate && rowDateFinal > endDate) continue;
      if (mode && String(row.mode) !== String(mode)) continue;
      if (type && row.type !== type) continue;

      const modeName = row.mode || "Cash";
      rows.push({
        id: `c-${key}-${row.id}`,
        date: rowDateFinal,
        portfolio_id: Number(pid),
        portfolio_name,
        shift_id: Number(sid),
        shift_name,
        bank_account: modeName,
        bank_name: bankNameForMode(modeName),
        mode: modeName,
        type: row.type,
        amount: Number(row.amount) || 0,
        category: row.category,
        description: row.description,
      });
    }
  }

  const portfolioFilterActive =
    portfolioId != null && portfolioId !== "" && String(portfolioId) !== "null";
  const shiftFilterActive = shiftId != null && shiftId !== "" && String(shiftId) !== "null";

  for (const ge of Object.values(db.globalEntries || {})) {
    const d = ge.date || todayISO();
    if (startDate && d < startDate) continue;
    if (endDate && d > endDate) continue;
    if (portfolioFilterActive) continue;
    if (shiftFilterActive) continue;
    if (mode && String(ge.mode) !== String(mode)) continue;
    if (type && ge.type !== type) continue;

    const modeName = ge.mode || "Cash";
    rows.push({
      id: `g-${ge.id}`,
      date: d,
      portfolio_id: null,
      portfolio_name: "Global",
      shift_id: null,
      shift_name: "N/A",
      bank_account: modeName,
      bank_name: bankNameForMode(modeName),
      mode: modeName,
      type: ge.type || "expense",
      amount: Number(ge.amount) || 0,
      category: ge.category,
      description: ge.description,
    });
  }

  rows.sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db_ = new Date(b.date).getTime();
    if (db_ !== da) return db_ - da;
    return String(b.id).localeCompare(String(a.id));
  });

  let total_income = 0;
  let total_expense = 0;
  for (const t of rows) {
    const amt = Number(t.amount) || 0;
    if (t.type === "net income") total_income += amt;
    else if (t.type === "expense") total_expense += amt;
  }

  return {
    transactions: rows,
    summary: {
      total_income,
      total_expense,
      net_cashflow: total_income - total_expense,
    },
  };
}

export function applyCashflowUpsert(body) {
  const rows = body?.cashflow ?? body?.cashFlow ?? (Array.isArray(body) ? body : []);
  if (!Array.isArray(rows)) return;
  for (const row of rows) {
    const pid = row.portfolio_id;
    const sid = row.shift_id;
    const date = row.date || todayISO();
    if (pid == null || sid == null) {
      applyGlobalCashflowRow(row);
      continue;
    }
    const key = cfKey(pid, sid, date);
    if (!db.cashflowByKey[key]) db.cashflowByKey[key] = {};
    const bucket = db.cashflowByKey[key];
    let id = row.id;
    if (id == null || id === "" || (typeof id === "string" && id.startsWith("temp-"))) {
      id = nextNumericKey(bucket);
    }
    const idx = String(id);
    bucket[idx] = {
      ...bucket[idx],
      ...row,
      id: Number(id),
      shift_id: Number(sid),
      portfolio_id: Number(pid),
      mode: row.mode,
      amount: row.amount,
      category: row.category ?? bucket[idx]?.category ?? "",
      description: row.description ?? row.category ?? "",
      type: row.type,
    };
  }
}

export function deleteCashflowEntryById(id) {
  const sid = String(id);
  if (db.globalEntries?.[sid]) {
    delete db.globalEntries[sid];
    return true;
  }
  for (const key of Object.keys(db.cashflowByKey)) {
    const bucket = db.cashflowByKey[key];
    for (const k of Object.keys(bucket)) {
      if (String(bucket[k].id) === sid) {
        delete bucket[k];
        return true;
      }
    }
  }
  return false;
}

/** Aggregate cashflow rows for island summary (types: "net income" | "expense"). */
export function summarizeCashflowBucket(bucket) {
  let net_income = 0;
  let expense = 0;
  for (const row of Object.values(bucket || {})) {
    const amt = Number(row.amount) || 0;
    if (row.type === "net income") net_income += amt;
    else if (row.type === "expense") expense += amt;
  }
  return {
    net_income,
    expense,
    credit: 0,
    total_cashflow: net_income + expense,
  };
}

/** Sum price × sold_quantity for meter rows (matches sales tab income). */
export function summarizeMeterTotalSales(bucket) {
  let total = 0;
  for (const row of Object.values(bucket || {})) {
    const price = Number(row.price);
    const sq = Number(row.sold_quantity);
    if (!Number.isNaN(price) && !Number.isNaN(sq)) {
      total += price * sq;
    }
  }
  return total;
}

/** Clear cashflow for one portfolio / shift / date (island tab). */
export function deleteCashflowBucket(portfolioId, shiftId, dateStr) {
  const key = cfKey(portfolioId, shiftId, dateStr);
  if (db.cashflowByKey[key]) db.cashflowByKey[key] = {};
}

/** Clear meter readings for one portfolio / shift / date. */
export function clearMeterBucket(portfolioId, shiftId, dateStr) {
  const key = cfKey(portfolioId, shiftId, dateStr);
  if (db.meterByKey[key]) db.meterByKey[key] = {};
}

export function deleteCashflowAllForDate(dateStr) {
  for (const key of Object.keys(db.cashflowByKey)) {
    const parts = key.split("_");
    const d = parts.at(-1);
    if (d === dateStr) db.cashflowByKey[key] = {};
  }
}

export function upsertGlobalExpense(body) {
  if (!db.globalExpense) db.globalExpense = {};
  let id = body.id;
  if (id == null) id = nextNumericKey(db.globalExpense);
  const k = String(id);
  const prev = db.globalExpense[k];
  const amt = Number(body.amount);
  db.globalExpense[k] = {
    ...prev,
    id: Number(id),
    name: body.name ?? body.label ?? prev?.name ?? "Expense",
    amount: Number.isFinite(amt) ? amt : (prev?.amount ?? 0),
  };
}

/** --- Products (all seeded dates) --- */

function forEachProductDate(fn) {
  for (const d of Object.keys(db.productsByDate)) {
    fn(db.productsByDate[d], d);
  }
}

function nextProductId() {
  let max = 0;
  forEachProductDate((prods) => {
    for (const k of Object.keys(prods)) {
      max = Math.max(max, Number(k) || 0);
    }
  });
  return max + 1;
}

export function applyProductAdd(body) {
  const id = body.id ?? nextProductId();
  const price = Number(body.price);
  const row = {
    id,
    product: body.product ?? body.name ?? `SKU-${String(id).padStart(3, "0")} New`,
    price: Number.isFinite(price) ? price : 1,
    category: body.category ?? "Fuel",
    uom: body.uom ?? "L",
    discontinued: Boolean(body.discontinued),
    created_at: new Date().toISOString(),
  };
  forEachProductDate((prods) => {
    prods[String(id)] = { ...row };
  });
  return id;
}

export function applyProductUpdate(body) {
  const id = body.id ?? body.product_id;
  if (id == null) return;
  const patch = { ...body };
  if (body.name != null) patch.product = body.name;
  if ("name" in patch) delete patch.name;
  if (patch.price != null) {
    const p = Number(patch.price);
    patch.price = Number.isFinite(p) ? p : patch.price;
  }
  if (patch.discontinued != null) patch.discontinued = Boolean(patch.discontinued);
  forEachProductDate((prods) => {
    const key = String(id);
    if (prods[key]) {
      const cur = prods[key];
      prods[key] = {
        ...cur,
        ...patch,
        id: Number(id),
        product: patch.product ?? cur.product,
      };
    }
  });
}

export function applyProductPriceUpdate(body) {
  applyProductUpdate(body);
}

export function deleteProductById(productId) {
  const k = String(productId);
  forEachProductDate((prods) => {
    delete prods[k];
  });
}

/** --- Customers --- */

export function applyCustomerAdd(body) {
  const ids = Object.keys(db.customers).map(Number);
  const newId = ids.length ? Math.max(...ids) + 1 : 1;
  const name = body.name ?? body.customer_name ?? `Customer ${newId}`;
  const bal = body.balance ?? body.outstanding ?? 0;
  const now = new Date().toISOString();
  db.customers[newId] = {
    id: newId,
    name,
    customer_name: name,
    email: body.email ?? `c${newId}@example.com`,
    contact_phone: body.contact_phone ?? "+15550000000",
    credit_limit: body.credit_limit ?? 5000,
    is_active: body.is_active !== false,
    balance: bal,
    outstanding: body.outstanding ?? bal,
    unbilled_amount: body.unbilled_amount ?? 0,
    created_at: now,
  };
  return newId;
}

export function applyCustomerUpdate(body, customerId) {
  const id = Number(customerId ?? body.id);
  if (Number.isNaN(id) || !db.customers[id]) return;
  const prev = db.customers[id];
  const merged = {
    ...prev,
    ...body,
    id: prev.id,
    name: body.name ?? prev.name,
    customer_name: body.customer_name ?? body.name ?? prev.customer_name,
  };
  if (body.balance !== undefined || body.outstanding !== undefined) {
    const b = body.balance ?? body.outstanding ?? prev.balance ?? 0;
    const o = body.outstanding ?? body.balance ?? prev.outstanding ?? prev.balance ?? b;
    merged.balance = b;
    merged.outstanding = o;
  } else {
    merged.balance = prev.balance ?? 0;
    merged.outstanding = prev.outstanding ?? prev.balance ?? 0;
  }
  if (body.unbilled_amount !== undefined) {
    merged.unbilled_amount = Number(body.unbilled_amount);
  } else if (merged.unbilled_amount === undefined) {
    merged.unbilled_amount = prev.unbilled_amount ?? 0;
  }
  db.customers[id] = merged;
}

function rebuildVehiclesGroupedFromList() {
  const grouped = {};
  for (const v of db.vehicles) {
    const key = String(v.customer_id);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push({ ...v, vehicle_no: v.vehicle_number });
  }
  db.vehiclesGrouped = grouped;
}

export function deleteCustomerById(id) {
  const k = Number(id);
  if (Number.isNaN(k) || !db.customers[k]) return;
  delete db.customers[k];
  db.vehicles = db.vehicles.filter((v) => Number(v.customer_id) !== k);
  rebuildVehiclesGroupedFromList();
  delete db.transactionsByCustomer[k];
  if (db.creditRecords?.data) {
    for (const ck of Object.keys(db.creditRecords.data)) {
      const row = db.creditRecords.data[ck];
      if (row && Number(row.customer_id) === k) {
        delete db.creditRecords.data[ck];
      }
    }
  }
}

export function toggleCustomerStatus(id) {
  const k = Number(id);
  if (Number.isNaN(k) || !db.customers[k]) return;
  db.customers[k].is_active = !db.customers[k].is_active;
}

/** --- Credit --- */

export function applyCreditUpsert(body) {
  if (!db.creditRecords.data) db.creditRecords.data = {};
  const data = db.creditRecords.data;
  let id = body.id;
  if (id == null) id = nextNumericKey(data);
  const k = String(id);
  data[k] = { ...data[k], ...body, id: Number(id) };
}

export function deleteCreditById(id) {
  if (db.creditRecords.data?.[String(id)]) {
    delete db.creditRecords.data[String(id)];
  }
}

/** --- Bank accounts & modes --- */

function nextIdFromArray(arr, key = "id") {
  const ids = arr.map((x) => Number(x[key]) || 0);
  return ids.length ? Math.max(...ids) + 1 : 1;
}

export function addBankAccount(body) {
  const id = nextIdFromArray(db.bankAccounts);
  db.bankAccounts.push({
    id,
    bank_name: body.bank_name ?? body.name ?? `Bank ${id}`,
  });
  return id;
}

export function deleteBankAccountById(id) {
  const idx = db.bankAccounts.findIndex((b) => String(b.id) === String(id));
  if (idx >= 0) db.bankAccounts.splice(idx, 1);
}

export function addMode(body) {
  const id = nextIdFromArray(db.modes);
  db.modes.push({
    id,
    mode_name: body.mode_name ?? body.name ?? `Mode ${id}`,
    associated_account: body.associated_account ?? 1,
  });
  return id;
}

export function deleteModeById(id) {
  const idx = db.modes.findIndex((m) => String(m.id) === String(id));
  if (idx >= 0) db.modes.splice(idx, 1);
}

/** --- Stock --- */

export function addStock(body) {
  const id =
    body.id ??
    Math.max(0, ...db.stockItems.map((s) => Number(s.id) || 0)) + 1;
  const qty =
    Number(body.stock ?? body.quantity ?? body.total_stock) ||
    0;
  const row = {
    id,
    stock_name: body.stock_name ?? `Tank ${id}`,
    product_name: body.product_name ?? body.name ?? `Product ${id}`,
    name: body.name ?? `Stock ${id}`,
    quantity: qty,
    total_stock: body.total_stock != null ? Number(body.total_stock) : qty,
    low_stock_limit: body.low_stock_limit ?? 20,
    alert_enabled: Boolean(body.alert_enabled),
    uom: body.uom ?? "L",
    type: body.type ?? "Bulk",
    capacity: body.capacity ?? 8000,
  };
  db.stockItems.push(row);
  return id;
}

export function updateStock(body) {
  const idx = db.stockItems.findIndex((s) => String(s.id) === String(body.id));
  if (idx < 0) return;
  const cur = db.stockItems[idx];
  const next = { ...cur, ...body };
  let qty;
  if (body.stock != null) qty = Number(body.stock);
  else if (body.quantity != null) qty = Number(body.quantity);
  else if (body.total_stock != null) qty = Number(body.total_stock);
  if (qty !== undefined && Number.isFinite(qty)) {
    next.quantity = qty;
    next.total_stock = qty;
  }
  db.stockItems[idx] = next;
}

export function deleteStockById(stockId) {
  const idx = db.stockItems.findIndex((s) => String(s.id) === String(stockId));
  if (idx >= 0) db.stockItems.splice(idx, 1);
  const k = String(stockId);
  if (db.stockTransactionHistoryByStockId?.[k]) delete db.stockTransactionHistoryByStockId[k];
  if (db.stockMeterHistoryByStockId?.[k]) delete db.stockMeterHistoryByStockId[k];
  if (db.stockLinkedUnitsByStockId?.[k]) delete db.stockLinkedUnitsByStockId[k];
}

export function updateStockAlert(body) {
  const id = body.id;
  const idx = db.stockItems.findIndex((s) => String(s.id) === String(id));
  if (idx < 0) return;
  const cur = db.stockItems[idx];
  const enabled = body.status ?? body.alert_enabled;
  db.stockItems[idx] = {
    ...cur,
    alert_enabled: typeof enabled === "boolean" ? enabled : cur.alert_enabled,
    low_stock_limit:
      body.low_stock_limit != null ? Number(body.low_stock_limit) : cur.low_stock_limit,
  };
}

export function appendStockTransaction(body) {
  const stockId = body.stock_id ?? body.stockId;
  if (stockId == null) return;
  const k = String(stockId);
  if (!db.stockTransactionHistoryByStockId[k]) db.stockTransactionHistoryByStockId[k] = {};
  const bucket = db.stockTransactionHistoryByStockId[k];
  const next = nextNumericKey(bucket);
  bucket[String(next)] = {
    transaction_id: body.transaction_id ?? next,
    date: body.date ?? todayISO(),
    transaction_type: body.transaction_type ?? body.type ?? "inbound",
    quantity: Number(body.quantity) || 0,
    amount: Number(body.amount) || 0,
    reference_no: body.reference_no ?? `REF-${next}`,
    notes: body.notes ?? "",
  };
}

function findTxKey(bucket, tid) {
  return Object.keys(bucket).find(
    (x) =>
      String(bucket[x].transaction_id) === String(tid) ||
      String(bucket[x].reference_no) === String(tid)
  );
}

export function updateStockTransactionRow(body) {
  const stockId = body.stock_id ?? body.stockId;
  const tid = body.transaction_id ?? body.id;
  if (stockId == null || tid == null) return;
  const k = String(stockId);
  const bucket = db.stockTransactionHistoryByStockId[k];
  if (!bucket) return;
  const key = findTxKey(bucket, tid);
  if (key) {
    bucket[key] = { ...bucket[key], ...body, transaction_id: bucket[key].transaction_id };
  }
}

/** DELETE only sends `id` query — scan all stock buckets */
export function deleteStockTransactionRowById(tid) {
  for (const stockId of Object.keys(db.stockTransactionHistoryByStockId || {})) {
    const bucket = db.stockTransactionHistoryByStockId[stockId];
    const key = findTxKey(bucket, tid);
    if (key) {
      delete bucket[key];
      return true;
    }
  }
  return false;
}

export function linkSalesUnitToStock(body) {
  const sid = String(body.stock_id ?? "");
  if (!sid) return;
  if (!db.stockLinkedUnitsByStockId[sid]) db.stockLinkedUnitsByStockId[sid] = [];
  const nextId = nextIdFromArray(db.stockLinkedUnitsByStockId[sid]);
  db.stockLinkedUnitsByStockId[sid].push({
    id: body.sales_unit_id ?? nextId,
    sales_unit_name: body.sales_unit_name ?? body.name ?? `Unit-${nextId}`,
    quantity: Number(body.quantity) || 0,
  });
}

export function unlinkSalesUnitFromStock(body) {
  const sid = String(body.stock_id ?? "");
  const unitId = body.sales_unit_id ?? body.id;
  const arr = db.stockLinkedUnitsByStockId[sid];
  if (!arr || unitId == null) return;
  const idx = arr.findIndex((u) => String(u.id) === String(unitId));
  if (idx >= 0) arr.splice(idx, 1);
}

/** --- Employees --- */

export function nextEmployeeId() {
  const ids = db.employees.map((e) => Number(e.id) || 0);
  return ids.length ? Math.max(...ids) + 1 : 1;
}

export function getEmployeesSortedNewestFirst() {
  return [...db.employees].sort(
    (a, b) => (Number(b.id) || 0) - (Number(a.id) || 0)
  );
}

export function applyEmployeeCreate(body) {
  const id = body.id ?? nextEmployeeId();
  const row = {
    id,
    name: body.name ?? "New Employee",
    role: body.role ?? "Operator",
    contact_number: body.contact_number ?? "",
    employee_id: body.employee_id ?? `EMP-${id}`,
    email: body.email ?? `emp${id}@demo.local`,
    salary: Number(body.salary ?? body.base_salary) || 35000,
  };
  db.employees.push(row);
  return row;
}

export function applyEmployeeUpdate(body) {
  const id = Number(body.id);
  if (Number.isNaN(id)) return;
  const idx = db.employees.findIndex((e) => Number(e.id) === id);
  if (idx < 0) return;
  const cur = db.employees[idx];
  db.employees[idx] = {
    ...cur,
    ...body,
    id,
    name: body.name ?? cur.name,
    role: body.role ?? cur.role,
    contact_number: body.contact_number ?? cur.contact_number,
    employee_id: body.employee_id ?? cur.employee_id,
    email: body.email ?? cur.email,
    salary: body.salary != null ? Number(body.salary) : cur.salary,
  };
}

export function deleteEmployeeById(id) {
  const idx = db.employees.findIndex((e) => String(e.id) === String(id));
  if (idx >= 0) db.employees.splice(idx, 1);
}

/** --- Portfolio rows (island list) — best-effort across dated snapshots --- */

function maxPortfolioRowId() {
  let max = 0;
  for (const d of Object.keys(db.portfolioByDate)) {
    for (const row of Object.values(db.portfolioByDate[d])) {
      max = Math.max(max, Number(row.id) || 0);
    }
  }
  return max;
}

export function applyPortfolioAdd(body) {
  const newId = maxPortfolioRowId() + 1;
  const pname = body.portfolio_name ?? body.name ?? "New Station";
  const shiftName = body.shift_name ?? "Morning";
  for (const d of Object.keys(db.portfolioByDate)) {
    db.portfolioByDate[d][String(newId)] = {
      id: newId,
      portfolio_id: body.portfolio_id ?? newId,
      portfolio_name: pname,
      shift_name: shiftName,
      shift_id: body.shift_id ?? newId,
      total_sales: 0,
      total_items: 0,
      overall_payment_received: 0,
      credit: 0,
    };
  }
  return newId;
}

export function applyPortfolioUpdate(body) {
  const targetId = body.id ?? body.shift_id;
  if (targetId == null) return;
  for (const d of Object.keys(db.portfolioByDate)) {
    const snap = db.portfolioByDate[d];
    for (const k of Object.keys(snap)) {
      if (String(snap[k].id) === String(targetId)) {
        snap[k] = { ...snap[k], ...body };
      }
    }
  }
}

export function deletePortfolioByPortfolioId(portfolioId) {
  const pid = String(portfolioId);
  for (const d of Object.keys(db.portfolioByDate)) {
    const snap = db.portfolioByDate[d];
    for (const k of Object.keys({ ...snap })) {
      if (String(snap[k].portfolio_id) === pid) {
        delete snap[k];
      }
    }
  }
}
