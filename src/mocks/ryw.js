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
  if (id == null || id === "") {
    id = nextNumericKey(bucket);
  }
  const idx = String(id);
  const existing = bucket[idx] || {};
  const closingNum =
    row.closing_reading != null && row.closing_reading !== ""
      ? Number(row.closing_reading)
      : null;
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
      bucket[k] = { ...row, status: next };
      return true;
    });
    if (found) return;
  }
  if (body.sales_unit_name) {
    forEachMeterEntry((row, bucket, k) => {
      if (row.sales_unit_name !== body.sales_unit_name) return;
      bucket[k] = { ...row, status: body.status };
      return true;
    });
  }
}

/** --- Cashflow (per portfolio/shift/date bucket) --- */

export function applyCashflowUpsert(body) {
  const rows = body?.cashflow ?? body?.cashFlow ?? (Array.isArray(body) ? body : []);
  if (!Array.isArray(rows)) return;
  for (const row of rows) {
    const pid = row.portfolio_id;
    const sid = row.shift_id;
    const date = row.date || todayISO();
    if (pid == null || sid == null) continue;
    const key = cfKey(pid, sid, date);
    if (!db.cashflowByKey[key]) db.cashflowByKey[key] = {};
    const bucket = db.cashflowByKey[key];
    let id = row.id;
    if (id == null) id = nextNumericKey(bucket);
    const idx = String(id);
    bucket[idx] = {
      ...bucket[idx],
      ...row,
      id: Number(id),
      shift_id: Number(sid),
      portfolio_id: Number(pid),
      mode: row.mode,
      amount: row.amount,
      description: row.description ?? row.category ?? "",
      type: row.type,
    };
  }
}

export function deleteCashflowEntryById(id) {
  const sid = String(id);
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
  const row = {
    id,
    product: body.product ?? body.name ?? `SKU-${String(id).padStart(3, "0")} New`,
    price: Number(body.price) || 1,
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
  forEachProductDate((prods) => {
    if (prods[String(id)]) {
      prods[String(id)] = { ...prods[String(id)], ...body, id: Number(id) };
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
  db.customers[newId] = {
    id: newId,
    name,
    customer_name: name,
    email: body.email ?? `c${newId}@example.com`,
    contact_phone: body.contact_phone ?? "+15550000000",
    credit_limit: body.credit_limit ?? 5000,
    is_active: body.is_active !== false,
    balance: body.balance ?? 0,
  };
  return newId;
}

export function applyCustomerUpdate(body, customerId) {
  const id = Number(customerId ?? body.id);
  if (Number.isNaN(id) || !db.customers[id]) return;
  db.customers[id] = {
    ...db.customers[id],
    ...body,
    name: body.name ?? db.customers[id].name,
    customer_name: body.customer_name ?? body.name ?? db.customers[id].customer_name,
  };
}

export function deleteCustomerById(id) {
  const k = Number(id);
  if (!Number.isNaN(k)) delete db.customers[k];
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
  const row = {
    id,
    stock_name: body.stock_name ?? `Tank ${id}`,
    product_name: body.product_name ?? body.name ?? `Product ${id}`,
    name: body.name ?? `Stock ${id}`,
    quantity: body.quantity ?? 0,
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
  if (idx >= 0) db.stockItems[idx] = { ...db.stockItems[idx], ...body };
}

export function deleteStockById(stockId) {
  const idx = db.stockItems.findIndex((s) => String(s.id) === String(stockId));
  if (idx >= 0) db.stockItems.splice(idx, 1);
}

/** --- Employees --- */

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
