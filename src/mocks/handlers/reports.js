import { http, HttpResponse } from "msw";
import { delayGet } from "../utils.js";
import { db } from "../db/index.js";
import {
  cfKey,
  summarizeCashflowBucket,
  summarizeMeterTotalSales,
  todayISO,
  buildIntegratedCashflowReportRows,
} from "../ryw.js";
import {
  buildCashflowEntriesDynamic,
  buildMeterReadingsDynamic,
} from "./domain.js";

const portfolioNames = [
  "North Island",
  "South Pier",
  "East Dock",
  "West Bay",
  "Central Hub",
];

function headerOverview() {
  const breakdown = {};
  portfolioNames.forEach((n, i) => {
    breakdown[n] = 1000 * (i + 1);
  });
  return {
    income: { total_income: 25000, breakdown: { ...breakdown } },
    expense: { total_expense: 8000, breakdown: { ...breakdown } },
    net_income: 17000,
  };
}

function islandWiseIncome() {
  const out = {};
  portfolioNames.forEach((name, pi) => {
    const row = { total_sales: 5000 + pi * 1000 };
    for (let p = 1; p <= 5; p++) {
      row[`Product ${p}`] = {
        sales: 200 + p * 10 + pi,
        category: "Fuel",
      };
    }
    out[name] = row;
  });
  return out;
}

function productWiseIncome() {
  return Array.from({ length: 12 }, (_, i) => ({
    name: `Product ${i + 1}`,
    total: 300 + i * 25,
  }));
}

/** useGlobalCashflowStore: ExpenseCashflow[name][category] = amount */
function categoryExpenseByPortfolio() {
  const out = {};
  portfolioNames.forEach((name, pi) => {
    out[name] = {
      Rent: 400 + pi * 40,
      Utilities: 220 + pi * 25,
      Payroll: 650 + pi * 35,
      Maintenance: 180 + pi * 15,
    };
  });
  return out;
}

/** useIntegratedCashflowStore.fetchCashflowSummary — CashflowSummaryCard */
function cashflowSummaryForDate() {
  const portfolio_breakdown = {};
  portfolioNames.forEach((name, i) => {
    portfolio_breakdown[name] = {
      net: 3500 + i * 400,
      credit: 200 + i * 30,
    };
  });
  return {
    income: {
      total_income: 28500,
      meter_sales_income: 17500,
      stock_sales_income: 11000,
    },
    expenses: {
      total_expenses: 8200,
      cashflow_expenses: 5100,
      stock_purchase_expenses: 3100,
    },
    credit: {
      total_credit: 2100,
    },
    summary: {
      net_cashflow: 18200,
      cash_on_hand: 16100,
    },
    portfolio_breakdown,
  };
}

export const reportHandlers = [
  http.get("*/report/cashflow_header_overview/get/:date", async () => {
    await delayGet();
    return HttpResponse.json(headerOverview());
  }),

  http.get("*/report/island_wise_income/get/:date", async () => {
    await delayGet();
    return HttpResponse.json(islandWiseIncome());
  }),

  http.get("*/report/product_wise_income/get/:date", async () => {
    await delayGet();
    return HttpResponse.json(productWiseIncome());
  }),

  http.get("*/report/category_wise_expense/get/:date", async () => {
    await delayGet();
    return HttpResponse.json(categoryExpenseByPortfolio());
  }),

  http.get("*/report/cashflow_summary/get/:date", async () => {
    await delayGet();
    return HttpResponse.json(cashflowSummaryForDate());
  }),

  http.get("*/report/outbound_stock_summary/get/:date", async ({ request }) => {
    await delayGet();
    const url = new URL(request.url);
    const pid = url.searchParams.get("portfolio_id");
    // useIntegratedCashflowStore uses response.data as list
    return HttpResponse.json({
      data: Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        portfolio_id: pid ? Number(pid) : 1,
        quantity: 10 + i,
        product: `SKU-${i + 1}`,
      })),
    });
  }),

  http.get(
    "*/report/integrated_cashflow_report/get/:start/:end",
    async ({ params, request }) => {
      await delayGet();
      let start = params.start;
      let end = params.end;
      if (!start || !end) {
        const url = new URL(request.url);
        const parts = url.pathname.split("/").filter(Boolean);
        const gi = parts.indexOf("get");
        if (gi >= 0 && parts[gi + 1] && parts[gi + 2]) {
          start = parts[gi + 1];
          end = parts[gi + 2];
        }
      }
      const { rows, totals } = buildIntegratedCashflowReportRows(
        start || todayISO(),
        end || todayISO()
      );
      const data = rows.length
        ? rows
        : (() => {
            const ds = todayISO();
            return [
              {
                date: ds,
                meter_sales: 0,
                stock_sales: 0,
                total_income: 0,
                cashflow_expenses: 0,
                stock_expenses: 0,
                total_expenses: 0,
                credits: 0,
                net_cashflow: 0,
                cash_on_hand: 0,
              },
            ];
          })();
      const keys = [
        "meter_sales",
        "stock_sales",
        "total_income",
        "cashflow_expenses",
        "stock_expenses",
        "total_expenses",
        "credits",
        "net_cashflow",
        "cash_on_hand",
      ];
      const totalsOut =
        rows.length > 0
          ? totals
          : keys.reduce((acc, k) => {
              acc[k] = data.reduce((s, r) => s + (Number(r[k]) || 0), 0);
              return acc;
            }, {});
      return HttpResponse.json({
        data,
        totals: totalsOut,
        date_range: { start, end },
      });
    }
  ),

  http.get(
    /.*\/report\/island_shift_specific_cashflow_summary\/get\/?$/,
    async ({ request }) => {
      await delayGet();
      const url = new URL(request.url);
      const dateRaw = url.searchParams.get("date") || "";
      const dateStr = dateRaw || todayISO();
      let portfolioId = url.searchParams.get("portfolio_id");
      let shiftId = url.searchParams.get("shift_id");
      /**
       * `cashflow_integration_service.getPortfolioCashflow` sends only `shift_id` in the query
       * and passes portfolio id in that param (client naming). Resolve real shift from config.
       */
      if (!portfolioId && shiftId) {
        portfolioId = shiftId;
        const row = Object.values(db.shiftConfigRows || {}).find(
          (r) => String(r.portfolio_id) === String(portfolioId)
        );
        shiftId = row ? String(row.shift_id) : String(shiftId);
      }
      if (!portfolioId) portfolioId = "1";
      if (!shiftId) shiftId = "1";
      const key = cfKey(portfolioId, shiftId, dateStr);
      let cfBucket = db.cashflowByKey[key];
      if (!cfBucket || Object.keys(cfBucket).length === 0) {
        cfBucket = buildCashflowEntriesDynamic(shiftId, portfolioId, dateStr);
      }
      let meterBucket = db.meterByKey[key];
      if (!meterBucket || Object.keys(meterBucket).length === 0) {
        meterBucket = buildMeterReadingsDynamic(portfolioId, shiftId, dateStr);
      }
      const cf = summarizeCashflowBucket(cfBucket);
      const total_sales = summarizeMeterTotalSales(meterBucket);
      return HttpResponse.json({
        ...cf,
        credit: 0,
        total_sales,
        date: dateStr,
        shift_id: shiftId,
        portfolio_id: portfolioId,
      });
    }
  ),
];
