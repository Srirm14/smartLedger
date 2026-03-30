import { http, HttpResponse } from "msw";
import { delayGet, delayWrite } from "../utils.js";
import { db } from "../db/index.js";
import { pathIs, pathRegex } from "../matchPath.js";
import {
  todayISO,
  cfKey,
  parseJson,
  applyBulkMeterUpsert,
  mergeOneMeterRow,
  deleteMeterReadingById,
  applyMeterChangeStatus,
  applyCashflowUpsert,
  deleteCashflowEntryById,
  deleteCashflowAllForDate,
  applyProductAdd,
  applyProductUpdate,
  applyProductPriceUpdate,
  deleteProductById,
  applyCustomerAdd,
  applyCustomerUpdate,
  deleteCustomerById,
  toggleCustomerStatus,
  applyCreditUpsert,
  deleteCreditById,
  addBankAccount,
  deleteBankAccountById,
  addMode,
  deleteModeById,
  addStock,
  updateStock,
  deleteStockById,
  updateStockAlert,
  appendStockTransaction,
  updateStockTransactionRow,
  deleteStockTransactionRowById,
  linkSalesUnitToStock,
  unlinkSalesUnitFromStock,
  deleteEmployeeById,
  applyPortfolioAdd,
  applyPortfolioUpdate,
  deletePortfolioByPortfolioId,
  upsertGlobalExpense,
} from "../ryw.js";

const portfolioNames = [
  "North Island",
  "South Pier",
  "East Dock",
  "West Bay",
  "Central Hub",
];

const today = todayISO;

function stockRowById(id) {
  const row = db.stockItems.find((s) => String(s.id) === String(id));
  return row || db.stockItems[0];
}

function mergedStockTransactionHistory(stockId) {
  const base = buildStockTransactionHistoryObject(stockId);
  const ext = db.stockTransactionHistoryByStockId?.[String(stockId)] || {};
  return { ...base, ...ext };
}

function mergedMeterReadingHistory(stockId) {
  const base = buildMeterReadingHistoryObject(stockId);
  const ext = db.stockMeterHistoryByStockId?.[String(stockId)] || {};
  return { ...base, ...ext };
}

function buildStockTransactionHistoryObject(stockId) {
  const out = {};
  const sid = Number(stockId) || 1;
  for (let i = 1; i <= 18; i++) {
    out[String(i)] = {
      transaction_id: sid * 100 + i,
      date: today(),
      transaction_type: i % 2 ? "inbound" : "outbound",
      quantity: 10 + i,
      amount: 500 + i * 25,
      reference_no: `REF-${sid}-${i}`,
      notes: i % 3 ? "Demo transaction" : "",
    };
  }
  return out;
}

function buildMeterReadingHistoryObject(stockId) {
  const out = {};
  const sid = Number(stockId) || 1;
  for (let i = 1; i <= 16; i++) {
    out[String(i)] = {
      sales_unit_id: sid * 10 + i,
      date: today(),
      sold_quantity: 5 + i,
      amount: 200 + i * 15,
    };
  }
  return out;
}

function buildCashflowEntriesDynamic(shiftId, portfolioId, date) {
  const entries = {};
  for (let i = 1; i <= 18; i++) {
    entries[i] = {
      id: i,
      shift_id: Number(shiftId),
      portfolio_id: Number(portfolioId),
      date,
      mode: i % 2 ? "Cash" : "Card",
      amount: 50 + i * 12,
      description: `Entry ${i}`,
      type: i % 3 ? "income" : "expense",
    };
  }
  return entries;
}

function buildMeterReadingsDynamic(portfolioId, shiftId, date) {
  const out = {};
  for (let i = 1; i <= 14; i++) {
    out[i] = {
      id: i,
      sales_unit_name: `Pump-${portfolioId}-${shiftId}-${i}`,
      portfolio_id: Number(portfolioId),
      shift_id: Number(shiftId),
      meter_reading: 10000 + i * 100,
      status: i % 7 === 0 ? "Discontinued" : "Active",
      date,
      product_id: (i % 20) + 1,
    };
  }
  return out;
}

/** Any calendar day — clone template so island list is never empty */
function resolvePortfolioSnapshot(date) {
  const d = date || today();
  const existing = db.portfolioByDate[d];
  if (existing && Object.keys(existing).length > 0) return existing;
  const templateKey =
    db.portfolioByDate[today()] && Object.keys(db.portfolioByDate[today()]).length
      ? today()
      : Object.keys(db.portfolioByDate).find((k) => Object.keys(db.portfolioByDate[k] || {}).length);
  const src = templateKey ? db.portfolioByDate[templateKey] : {};
  if (!src || Object.keys(src).length === 0) return {};
  const clone = structuredClone(src);
  db.portfolioByDate[d] = clone;
  return clone;
}

function resolveProductsSnapshot(date) {
  const d = date || today();
  const existing = db.productsByDate[d];
  if (existing && Object.keys(existing).length > 0) return existing;
  const templateKey =
    db.productsByDate[today()] && Object.keys(db.productsByDate[today()]).length
      ? today()
      : Object.keys(db.productsByDate).find((k) => Object.keys(db.productsByDate[k] || {}).length);
  const src = templateKey ? db.productsByDate[templateKey] : {};
  if (!src || Object.keys(src).length === 0) return {};
  const clone = structuredClone(src);
  db.productsByDate[d] = clone;
  return clone;
}

export const domainHandlers = [
  http.get("*/employees/get_all", async () => {
    await delayGet();
    return HttpResponse.json(db.employees);
  }),

  http.get("*/employees/:id", async ({ params }) => {
    await delayGet();
    const row = db.employees.find((e) => String(e.id) === String(params.id));
    return HttpResponse.json(row || {});
  }),

  http.post("*/employees/create", async ({ request }) => {
    await delayWrite();
    const body = await request.json();
    const id = db.employees.length + 1;
    const row = { id, ...body };
    db.employees.push(row);
    return HttpResponse.json(row);
  }),

  http.put("*/employees/update", async ({ request }) => {
    await delayWrite();
    const body = await request.json();
    const idx = db.employees.findIndex((e) => e.id === body.id);
    if (idx >= 0) db.employees[idx] = { ...db.employees[idx], ...body };
    return HttpResponse.json({ ok: true });
  }),

  http.delete("*/employees/delete/:id", async ({ params }) => {
    await delayWrite();
    deleteEmployeeById(params.id);
    return HttpResponse.json({ ok: true });
  }),

  http.get("*/product/get", async ({ request }) => {
    await delayGet();
    const url = new URL(request.url);
    const date = url.searchParams.get("date") || today();
    return HttpResponse.json(resolveProductsSnapshot(date));
  }),

  http.post("*/product/add_product", async ({ request }) => {
    await delayWrite();
    const body = await parseJson(request);
    const id = applyProductAdd(body);
    return HttpResponse.json({ id, message: "ok" });
  }),

  http.post("*/product/update_price", async ({ request }) => {
    await delayWrite();
    const body = await parseJson(request);
    applyProductPriceUpdate(body);
    return HttpResponse.json({ ok: true });
  }),

  http.delete("*/product/delete_product/:productId", async ({ params }) => {
    await delayWrite();
    deleteProductById(params.productId);
    return HttpResponse.json({ ok: true });
  }),

  http.get("*/product/get_linked_portfolio/:id", async () => {
    await delayGet();
    return HttpResponse.json({ linked: [1, 2, 3] });
  }),

  http.post("*/product/update_product", async ({ request }) => {
    await delayWrite();
    const body = await parseJson(request);
    applyProductUpdate(body);
    return HttpResponse.json({ ok: true });
  }),

  http.get("*/portfolio/get", async ({ request }) => {
    await delayGet();
    const url = new URL(request.url);
    const date = url.searchParams.get("date") || today();
    return HttpResponse.json(resolvePortfolioSnapshot(date));
  }),

  http.post("*/portfolio/add", async ({ request }) => {
    await delayWrite();
    const body = await parseJson(request);
    const id = applyPortfolioAdd(body);
    return HttpResponse.json({ id, message: "ok" });
  }),

  http.post("*/portfolio/update", async ({ request }) => {
    await delayWrite();
    const body = await parseJson(request);
    applyPortfolioUpdate(body);
    return HttpResponse.json({ ok: true });
  }),

  http.delete("*/portfolio/delete", async ({ request }) => {
    await delayWrite();
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (id) deletePortfolioByPortfolioId(id);
    return HttpResponse.json({ ok: true });
  }),

  http.get("*/meter_reading/get", async ({ request }) => {
    await delayGet();
    const url = new URL(request.url);
    const portfolioId = url.searchParams.get("portfolio_id");
    const shiftId = url.searchParams.get("shift_id");
    const date = url.searchParams.get("date") || today();
    const key = cfKey(portfolioId, shiftId, date);
    let data = db.meterByKey[key];
    if (!data || Object.keys(data).length === 0) {
      data = buildMeterReadingsDynamic(portfolioId, shiftId, date);
      db.meterByKey[key] = data;
    }
    return HttpResponse.json(data);
  }),

  http.post("*/meter_reading/add", async ({ request }) => {
    await delayWrite();
    const body = await parseJson(request);
    mergeOneMeterRow(body);
    return HttpResponse.json({ status: 200, data: {} });
  }),

  http.post("*/meter_reading/update_meter_reading", async ({ request }) => {
    await delayWrite();
    const body = await parseJson(request);
    mergeOneMeterRow(body);
    return HttpResponse.json({ ok: true });
  }),

  http.post("*/meter_reading/change_status", async ({ request }) => {
    await delayWrite();
    const body = await parseJson(request);
    applyMeterChangeStatus(body);
    return HttpResponse.json({ ok: true });
  }),

  http.get("*/meter_reading/get_all", async () => {
    await delayGet();
    return HttpResponse.json(db.meterReadingsAll);
  }),

  http.post("*/meter_reading/bulk_upsert", async ({ request }) => {
    await delayWrite();
    const body = await parseJson(request);
    const readings = Array.isArray(body) ? body : body.readings ?? body.data ?? [];
    applyBulkMeterUpsert(readings);
    return HttpResponse.json({ status: 200, data: {} });
  }),

  http.post("*/meter_reading/delete", async ({ request }) => {
    await delayWrite();
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (id) deleteMeterReadingById(id);
    return HttpResponse.json({ ok: true });
  }),

  http.get("*/meter_reading/sales_unit", async ({ request }) => {
    await delayGet();
    const url = new URL(request.url);
    const productId = url.searchParams.get("product_id");
    return HttpResponse.json(
      Array.from({ length: 18 }, (_, i) => ({
        id: i + 1,
        name: `Unit-${productId}-${i + 1}`,
        sales_unit_name: `Unit-${productId}-${i + 1}`,
      }))
    );
  }),

  http.post("*/tally/get", async () => {
    await delayWrite();
    return HttpResponse.json({ summary: { total: 10000 } });
  }),

  http.post("*/tally/get_tally_summary", async () => {
    await delayWrite();
    return HttpResponse.json({ rows: [] });
  }),

  http.get("*/cashflow/:portfolioId/get", async ({ params, request }) => {
    await delayGet();
    const url = new URL(request.url);
    const shiftId = url.searchParams.get("shift_id");
    const date = url.searchParams.get("date") || today();
    const key = cfKey(params.portfolioId, shiftId, date);
    let data = db.cashflowByKey[key];
    if (!data || Object.keys(data).length === 0) {
      data = buildCashflowEntriesDynamic(shiftId, params.portfolioId, date);
      db.cashflowByKey[key] = data;
    }
    return HttpResponse.json({ data });
  }),

  http.post("*/cashflow/upsert", async ({ request }) => {
    await delayWrite();
    const body = await parseJson(request);
    applyCashflowUpsert(body);
    return HttpResponse.json({ ok: true });
  }),

  http.delete("*/cashflow/delete", async ({ request }) => {
    await delayWrite();
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (id) deleteCashflowEntryById(id);
    return HttpResponse.json({ ok: true });
  }),

  http.delete("*/cashflow/delete_all", async ({ request }) => {
    await delayWrite();
    const url = new URL(request.url);
    const date = url.searchParams.get("date");
    if (date) deleteCashflowAllForDate(date);
    return HttpResponse.json({ ok: true });
  }),

  http.get("*/cashflow/global_expense", async () => {
    await delayGet();
    return HttpResponse.json(db.globalExpense);
  }),

  http.get("*/cashflow/get_all_cashflow", async () => {
    await delayGet();
    return HttpResponse.json(db.allCashflow.length ? db.allCashflow : []);
  }),

  http.get("*/cashflow/transaction_ledger", async () => {
    await delayGet();
    return HttpResponse.json({
      success: true,
      data: {
        transactions: Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          amount: 100 + i * 5,
          type: i % 2 ? "income" : "expense",
          mode: "Cash",
        })),
        summary: {
          total_income: 12000,
          total_expense: 4000,
          net_cashflow: 8000,
        },
      },
    });
  }),

  http.post("*/cashflow/expense/add", async ({ request }) => {
    await delayWrite();
    const body = await parseJson(request);
    upsertGlobalExpense(body);
    return HttpResponse.json({ ok: true });
  }),

  http.post("*/cashflow/expense/update", async ({ request }) => {
    await delayWrite();
    const body = await parseJson(request);
    upsertGlobalExpense(body);
    return HttpResponse.json({ ok: true });
  }),

  http.get("*/cashflow/global_entries", async () => {
    await delayGet();
    return HttpResponse.json({ 1: { id: 1, label: "Entry A" } });
  }),

  http.get("*/customer/get", async () => {
    await delayGet();
    return HttpResponse.json(db.customers);
  }),

  http.post("*/customer/add", async ({ request }) => {
    await delayWrite();
    const body = await parseJson(request);
    const id = applyCustomerAdd(body);
    return HttpResponse.json({ id });
  }),

  http.put("*/customer/update", async ({ request }) => {
    await delayWrite();
    const url = new URL(request.url);
    const cid = url.searchParams.get("customer_id");
    const body = await parseJson(request);
    applyCustomerUpdate(body, cid ? Number(cid) : undefined);
    return HttpResponse.json({ ok: true });
  }),

  http.delete("*/customer/delete", async ({ request }) => {
    await delayWrite();
    const url = new URL(request.url);
    const id = url.searchParams.get("customer_id") ?? url.searchParams.get("id");
    if (id) deleteCustomerById(id);
    return HttpResponse.json({ ok: true });
  }),

  http.put("*/customer/toggle_status", async ({ request }) => {
    await delayWrite();
    const url = new URL(request.url);
    const id = url.searchParams.get("customer_id") ?? url.searchParams.get("id");
    if (id) toggleCustomerStatus(id);
    const active = id ? db.customers[Number(id)]?.is_active : true;
    return HttpResponse.json({ is_active: active });
  }),

  http.get("*/customer/vehicle_details", async ({ request }) => {
    await delayGet();
    const url = new URL(request.url);
    const cid = Number(url.searchParams.get("customer_id"));
    return HttpResponse.json(
      db.vehicles.filter((v) => v.customer_id === cid)
    );
  }),

  http.get("*/customer/vehicle_details/all", async () => {
    await delayGet();
    // useCreditCustomerStore expects body { data: { [customerId]: vehicles[] } }
    return HttpResponse.json({ data: db.vehiclesGrouped });
  }),

  http.post("*/customer/vehicle_details/upsert", async ({ request }) => {
    await delayWrite();
    const body = await parseJson(request);
    const cid = Number(body.customer_id);
    if (!Number.isNaN(cid)) {
      const existing = db.vehicles.find(
        (v) => v.customer_id === cid && String(v.id) === String(body.id)
      );
      if (existing) {
        Object.assign(existing, body, {
          vehicle_number: body.vehicle_number ?? body.vehicle_no ?? existing.vehicle_number,
        });
      } else {
        const vid = Math.max(0, ...db.vehicles.map((v) => Number(v.id) || 0)) + 1;
        db.vehicles.push({
          id: body.id ?? vid,
          customer_id: cid,
          vehicle_number: body.vehicle_number ?? body.vehicle_no ?? `NEW-${vid}`,
          type: body.type ?? "Van",
        });
      }
      const grouped = {};
      for (const v of db.vehicles) {
        const k = String(v.customer_id);
        if (!grouped[k]) grouped[k] = [];
        grouped[k].push({ ...v, vehicle_no: v.vehicle_number });
      }
      db.vehiclesGrouped = grouped;
    }
    return HttpResponse.json({ ok: true });
  }),

  http.delete("*/customer/vehicle_details/delete", async ({ request }) => {
    await delayWrite();
    const url = new URL(request.url);
    const vid = url.searchParams.get("id") ?? url.searchParams.get("vehicle_id");
    if (vid) {
      const idx = db.vehicles.findIndex((v) => String(v.id) === String(vid));
      if (idx >= 0) db.vehicles.splice(idx, 1);
      const grouped = {};
      for (const v of db.vehicles) {
        const k = String(v.customer_id);
        if (!grouped[k]) grouped[k] = [];
        grouped[k].push({ ...v, vehicle_no: v.vehicle_number });
      }
      db.vehiclesGrouped = grouped;
    }
    return HttpResponse.json({ ok: true });
  }),

  http.get("*/customer/transaction", async ({ request }) => {
    await delayGet();
    const url = new URL(request.url);
    const cid = Number(url.searchParams.get("customer_id"));
    return HttpResponse.json(db.transactionsByCustomer[cid] || []);
  }),

  http.delete("*/customer/transaction_delete", async () => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),

  http.post("*/customer/transaction_payment_upsert", async () => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),

  http.post("*/customer/generate_bill", async () => {
    await delayWrite();
    return HttpResponse.json({ bill_id: 1 });
  }),

  http.get("*/customer/customer_details", async ({ request }) => {
    await delayGet();
    const url = new URL(request.url);
    const cid = Number(url.searchParams.get("customer_id"));
    const c = db.customers[cid] || {};
    return HttpResponse.json({
      ...c,
      customer_name: c.customer_name ?? c.name,
    });
  }),

  http.get("*/credit/get", async ({ request }) => {
    await delayGet();
    const url = new URL(request.url);
    const page = url.searchParams.get("page") || "1";
    const rec = db.creditRecords;
    return HttpResponse.json({
      data: rec.data,
      total_count: rec.total_count ?? 20,
      page: Number(page),
      page_size: rec.page_size ?? 20,
    });
  }),

  http.post("*/credit/upsert_credit", async ({ request }) => {
    await delayWrite();
    const body = await parseJson(request);
    applyCreditUpsert(body);
    return HttpResponse.json({ ok: true });
  }),

  http.delete("*/credit/delete_credit", async ({ request }) => {
    await delayWrite();
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (id) deleteCreditById(id);
    return HttpResponse.json({ ok: true });
  }),

  http.post("*/credit/insert_credit", async ({ request }) => {
    await delayWrite();
    const body = await parseJson(request);
    applyCreditUpsert(body);
    return HttpResponse.json({ ok: true });
  }),

  http.post("*/credit/download_credit_report_csv", async () => {
    await delayWrite();
    const csv = "id,name,amount\n1,Demo,100\n";
    return new HttpResponse(new Blob([csv], { type: "text/csv" }), {
      status: 200,
    });
  }),

  http.post("*/credit/send_credit_report_email", async () => {
    await delayWrite();
    return HttpResponse.json({ message: "sent" });
  }),

  http.get("*/credit/preview_credit_report", async () => {
    await delayGet();
    return HttpResponse.json({ lines: [] });
  }),

  http.post("*/credit/generate_credit_report/", async () => {
    await delayWrite();
    return HttpResponse.json({ report_id: 1 });
  }),

  http.post("*/bank_account/add", async ({ request }) => {
    await delayWrite();
    const body = await parseJson(request);
    const id = addBankAccount(body);
    return HttpResponse.json({ id });
  }),

  http.get("*/bank_account/get", async () => {
    await delayGet();
    return HttpResponse.json(db.bankAccounts);
  }),

  http.post("*/bank_account/delete", async ({ request }) => {
    await delayWrite();
    const body = await parseJson(request);
    const id = body.id ?? new URL(request.url).searchParams.get("id");
    if (id) deleteBankAccountById(id);
    return HttpResponse.json({ ok: true });
  }),

  http.post("*/mode/add", async ({ request }) => {
    await delayWrite();
    const body = await parseJson(request);
    const id = addMode(body);
    return HttpResponse.json({ id });
  }),

  http.get("*/mode/get", async () => {
    await delayGet();
    return HttpResponse.json(db.modes);
  }),

  http.post("*/mode/delete", async ({ request }) => {
    await delayWrite();
    const body = await parseJson(request);
    const id = body.id ?? new URL(request.url).searchParams.get("id");
    if (id) deleteModeById(id);
    return HttpResponse.json({ ok: true });
  }),

  http.get("*/mode/list", async () => {
    await delayGet();
    return HttpResponse.json(db.modes);
  }),

  http.get("*/portfolio/get_shifts", async () => {
    await delayGet();
    // useShiftConfigStore.transformShiftData expects object of rows with portfolio_name, shift_name, etc.
    return HttpResponse.json(db.shiftConfigRows);
  }),

  http.post("*/portfolio/add_shift", async () => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),

  http.post("*/portfolio/disable_shift", async () => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),

  http.post("*/portfolio/edit_shift", async () => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),

  http.get("*/portfolio/list", async () => {
    await delayGet();
    return HttpResponse.json(
      Array.from({ length: 18 }, (_, i) => ({
        id: i + 1,
        portfolio_name: portfolioNames[i % portfolioNames.length],
      }))
    );
  }),

  http.get("*/portfolio/list_shifts/:portfolioId/:date", async ({ params }) => {
    await delayGet();
    const pid = Number(params.portfolioId) || 1;
    // useSettingStore.fetchPortfolioShifts: needs id, portfolio_id, shift_*, times
    const shifts = ["Morning", "Evening", "Night"].map((name, i) => ({
      id: pid * 100 + i + 1,
      portfolio_id: pid,
      shift_name: name,
      shift_start_time: `${String(6 + i * 8).padStart(2, "0")}:00`,
      shift_end_time: `${String(14 + i * 8).padStart(2, "0")}:00`,
      active: true,
    }));
    return HttpResponse.json(shifts);
  }),

  http.put("*/portfolio/disable_enable_shift", async () => {
    await delayWrite();
    return HttpResponse.json({ message: "ok" });
  }),

  http.delete("*/portfolio/delete_shift/:shiftId", async () => {
    await delayWrite();
    return HttpResponse.json({ message: "ok" });
  }),

  http.get(pathIs("/stock_management/get"), async () => {
    await delayGet();
    const sorted = [...db.stockItems].sort(
      (a, b) => (Number(b.id) || 0) - (Number(a.id) || 0)
    );
    return HttpResponse.json(sorted);
  }),

  http.post(pathIs("/stock_management/add_stock"), async ({ request }) => {
    await delayWrite();
    const body = await parseJson(request);
    const id = addStock(body);
    return HttpResponse.json({ id, status: "success" });
  }),

  http.post(pathIs("/stock_management/update"), async ({ request }) => {
    await delayWrite();
    const body = await parseJson(request);
    updateStock(body);
    return HttpResponse.json({ status: "success", message: "Updated" });
  }),

  http.post(pathIs("/stock_management/update_alert"), async ({ request }) => {
    await delayWrite();
    const body = await parseJson(request);
    updateStockAlert(body);
    return HttpResponse.json({ status: "success", message: "Alert updated" });
  }),

  http.get(pathIs("/stock_management/get_stock_details"), async ({ request }) => {
    await delayGet();
    const id = new URL(request.url).searchParams.get("id");
    const row = stockRowById(id);
    return HttpResponse.json([
      {
        ...row,
        low_stock_alert: row.alert_enabled,
        sales_unit_names: [`Pump-${row.id}-A`, `Pump-${row.id}-B`],
      },
    ]);
  }),

  http.get(pathIs("/stock_management/get_stock_management_header"), async ({ request }) => {
    await delayGet();
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const row = stockRowById(id);
    const cap = row.capacity || 8000;
    const level = Math.min(Math.round(cap * 0.42), cap);
    return HttpResponse.json({
      stock_level: level,
      capacity: cap,
      inbound: 140,
      outbound: 95,
    });
  }),

  http.get(pathIs("/stock_management/get_stock_transaction_history"), async ({ request }) => {
    await delayGet();
    const id = new URL(request.url).searchParams.get("id");
    return HttpResponse.json(mergedStockTransactionHistory(id));
  }),

  http.get(pathIs("/stock_management/get_meter_reading_history"), async ({ request }) => {
    await delayGet();
    const id = new URL(request.url).searchParams.get("id");
    return HttpResponse.json(mergedMeterReadingHistory(id));
  }),

  http.get(pathIs("/stock_management/get_stock_sales_unit_link"), async ({ request }) => {
    await delayGet();
    const id = new URL(request.url).searchParams.get("id");
    const base = [
      { id: Number(id) * 2, sales_unit_name: `Linked-Unit-${id}-1`, quantity: 12 },
      { id: Number(id) * 2 + 1, sales_unit_name: `Linked-Unit-${id}-2`, quantity: 8 },
    ];
    const custom = db.stockLinkedUnitsByStockId?.[String(id)] ?? [];
    const merged = [...base];
    for (const c of custom) {
      if (!merged.some((m) => String(m.id) === String(c.id))) merged.push(c);
    }
    return HttpResponse.json(merged);
  }),

  http.post(pathIs("/stock_management/link_sales_unit"), async ({ request }) => {
    await delayWrite();
    const body = await parseJson(request);
    linkSalesUnitToStock(body);
    return HttpResponse.json({ status: "success", message: "Linked" });
  }),

  http.post(pathIs("/stock_management/unlink_sales_unit"), async ({ request }) => {
    await delayWrite();
    const body = await parseJson(request);
    unlinkSalesUnitFromStock(body);
    return HttpResponse.json({ status: "success", message: "Unlinked" });
  }),

  http.post(pathIs("/stock_management/add_stock_transaction"), async ({ request }) => {
    await delayWrite();
    const body = await parseJson(request);
    appendStockTransaction(body);
    return HttpResponse.json({ status: "success", message: "Stock added" });
  }),

  http.post(pathIs("/stock_management/update_stock_transaction"), async ({ request }) => {
    await delayWrite();
    const body = await parseJson(request);
    updateStockTransactionRow(body);
    return HttpResponse.json({ status: "success", message: "Transaction updated" });
  }),

  http.delete(pathIs("/stock_management/delete_stock_transaction"), async ({ request }) => {
    await delayWrite();
    const tid = new URL(request.url).searchParams.get("id");
    if (tid) deleteStockTransactionRowById(tid);
    return HttpResponse.json({ status: "success", message: "Deleted" });
  }),

  http.delete(
    pathRegex(/^\/stock_management\/delete_stock\/[^/]+$/),
    async ({ request }) => {
      await delayWrite();
      const stockId = new URL(request.url).pathname.split("/").pop();
      deleteStockById(stockId);
      return HttpResponse.json({ status: "success", message: "Stock deleted" });
    }
  ),
];
