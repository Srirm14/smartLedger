import { http, HttpResponse } from "msw";
import { delayGet, delayWrite } from "../utils.js";
import { db } from "../db/index.js";

const portfolioNames = [
  "North Island",
  "South Pier",
  "East Dock",
  "West Bay",
  "Central Hub",
];

const today = () => new Date().toISOString().split("T")[0];

function cfKey(portfolioId, shiftId, date) {
  return `${portfolioId}_${shiftId}_${date}`;
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

  http.delete("*/employees/delete/:id", async () => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),

  http.get("*/product/get", async ({ request }) => {
    await delayGet();
    const url = new URL(request.url);
    const date = url.searchParams.get("date") || today();
    return HttpResponse.json(db.productsByDate[date] || db.productsByDate[today()] || {});
  }),

  http.post("*/product/add_product", async () => {
    await delayWrite();
    return HttpResponse.json({ id: 99, message: "ok" });
  }),

  http.post("*/product/update_price", async () => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),

  http.delete("*/product/delete_product/:productId", async () => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),

  http.get("*/product/get_linked_portfolio/:id", async () => {
    await delayGet();
    return HttpResponse.json({ linked: [1, 2, 3] });
  }),

  http.post("*/product/update_product", async () => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),

  http.get("*/portfolio/get", async ({ request }) => {
    await delayGet();
    const url = new URL(request.url);
    const date = url.searchParams.get("date") || today();
    return HttpResponse.json(db.portfolioByDate[date] || db.portfolioByDate[today()] || {});
  }),

  http.post("*/portfolio/add", async () => {
    await delayWrite();
    return HttpResponse.json({ id: 99, message: "ok" });
  }),

  http.post("*/portfolio/update", async () => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),

  http.delete("*/portfolio/delete", async () => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),

  http.get("*/meter_reading/get", async ({ request }) => {
    await delayGet();
    const url = new URL(request.url);
    const portfolioId = url.searchParams.get("portfolio_id");
    const shiftId = url.searchParams.get("shift_id");
    const date = url.searchParams.get("date") || today();
    const key = cfKey(portfolioId, shiftId, date);
    const data = db.meterByKey[key] || Object.values(db.meterByKey)[0] || {};
    return HttpResponse.json(data);
  }),

  http.post("*/meter_reading/add", async () => {
    await delayWrite();
    return HttpResponse.json({ status: 200, data: {} });
  }),

  http.post("*/meter_reading/update_meter_reading", async () => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),

  http.post("*/meter_reading/change_status", async () => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),

  http.get("*/meter_reading/get_all", async () => {
    await delayGet();
    return HttpResponse.json(db.meterReadingsAll);
  }),

  http.post("*/meter_reading/bulk_upsert", async () => {
    await delayWrite();
    return HttpResponse.json({ status: 200, data: {} });
  }),

  http.post("*/meter_reading/delete", async () => {
    await delayWrite();
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
    const data = db.cashflowByKey[key] || {};
    return HttpResponse.json({ data });
  }),

  http.post("*/cashflow/upsert", async ({ request }) => {
    await delayWrite();
    let body = {};
    try {
      body = await request.json();
    } catch {
      /* */
    }
    if (body.cashflow && Array.isArray(body.cashflow)) {
      db.allCashflow = [...db.allCashflow, ...body.cashflow];
    }
    return HttpResponse.json({ ok: true });
  }),

  http.delete("*/cashflow/delete", async ({ request }) => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),

  http.delete("*/cashflow/delete_all", async () => {
    await delayWrite();
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

  http.post("*/cashflow/expense/add", async () => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),

  http.post("*/cashflow/expense/update", async () => {
    await delayWrite();
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

  http.post("*/customer/add", async () => {
    await delayWrite();
    return HttpResponse.json({ id: 99 });
  }),

  http.put("*/customer/update", async () => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),

  http.delete("*/customer/delete", async () => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),

  http.put("*/customer/toggle_status", async () => {
    await delayWrite();
    return HttpResponse.json({ is_active: true });
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
    return HttpResponse.json(db.vehicles);
  }),

  http.post("*/customer/vehicle_details/upsert", async () => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),

  http.delete("*/customer/vehicle_details/delete", async () => {
    await delayWrite();
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
    return HttpResponse.json(db.customers[cid] || {});
  }),

  http.get("*/credit/get", async ({ request }) => {
    await delayGet();
    const url = new URL(request.url);
    const page = url.searchParams.get("page") || "1";
    return HttpResponse.json({
      ...db.creditRecords,
      page: Number(page),
    });
  }),

  http.post("*/credit/upsert_credit", async () => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),

  http.delete("*/credit/delete_credit", async () => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),

  http.post("*/credit/insert_credit", async () => {
    await delayWrite();
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

  http.post("*/bank_account/add", async () => {
    await delayWrite();
    return HttpResponse.json({ id: 99 });
  }),

  http.get("*/bank_account/get", async () => {
    await delayGet();
    return HttpResponse.json(db.bankAccounts);
  }),

  http.post("*/bank_account/delete", async () => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),

  http.post("*/mode/add", async () => {
    await delayWrite();
    return HttpResponse.json({ id: 99 });
  }),

  http.get("*/mode/get", async () => {
    await delayGet();
    return HttpResponse.json(db.modes);
  }),

  http.post("*/mode/delete", async () => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),

  http.get("*/mode/list", async () => {
    await delayGet();
    return HttpResponse.json(db.modes);
  }),

  http.get("*/portfolio/get_shifts", async () => {
    await delayGet();
    return HttpResponse.json({ shifts: [] });
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

  http.get("*/portfolio/list_shifts/:portfolioId/:date", async () => {
    await delayGet();
    return HttpResponse.json(
      Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        shift_name: `Shift ${i + 1}`,
        active: true,
      }))
    );
  }),

  http.put("*/portfolio/disable_enable_shift", async () => {
    await delayWrite();
    return HttpResponse.json({ message: "ok" });
  }),

  http.delete("*/portfolio/delete_shift/:shiftId", async () => {
    await delayWrite();
    return HttpResponse.json({ message: "ok" });
  }),

  http.get("*/Organisation", async () => {
    await delayGet();
    return HttpResponse.json(db.organisation);
  }),

  http.get("*/user", async () => {
    await delayGet();
    return HttpResponse.json(db.user);
  }),

  http.get("*/stock_management/get", async () => {
    await delayGet();
    return HttpResponse.json(db.stockItems);
  }),

  http.post("*/stock_management/add_stock", async () => {
    await delayWrite();
    return HttpResponse.json({ id: 99 });
  }),

  http.post("*/stock_management/update", async () => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),

  http.post("*/stock_management/update_alert", async () => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),

  http.get("*/stock_management/get_stock_details", async () => {
    await delayGet();
    return HttpResponse.json({ id: 1, name: "Stock A", quantity: 100 });
  }),

  http.get("*/stock_management/get_stock_management_header", async () => {
    await delayGet();
    return HttpResponse.json({ header: "mock" });
  }),

  http.get("*/stock_management/get_stock_transaction_history", async () => {
    await delayGet();
    return HttpResponse.json([]);
  }),

  http.get("*/stock_management/get_meter_reading_history", async () => {
    await delayGet();
    return HttpResponse.json([]);
  }),

  http.get("*/stock_management/get_stock_sales_unit_link", async () => {
    await delayGet();
    return HttpResponse.json([]);
  }),

  http.post("*/stock_management/link_sales_unit", async () => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),

  http.post("*/stock_management/unlink_sales_unit", async () => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),

  http.post("*/stock_management/add_stock_transaction", async () => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),

  http.post("*/stock_management/update_stock_transaction", async () => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),

  http.delete("*/stock_management/delete_stock_transaction", async () => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),

  http.delete("*/stock_management/delete_stock/:stockId", async () => {
    await delayWrite();
    return HttpResponse.json({ ok: true });
  }),
];
