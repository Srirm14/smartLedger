import { http, HttpResponse } from "msw";
import { delayGet } from "../utils.js";
import { db } from "../db/index.js";
import {
  cfKey,
  summarizeCashflowBucket,
  summarizeMeterTotalSales,
  todayISO,
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
    async ({ params }) => {
      await delayGet();
      const { start, end } = params;
      const rows = [];
      const a = new Date(`${start}T12:00:00`);
      const b = new Date(`${end}T12:00:00`);
      if (!Number.isNaN(a.getTime()) && !Number.isNaN(b.getTime())) {
        for (
          let d = new Date(a);
          d <= b && rows.length < 45;
          d.setDate(d.getDate() + 1)
        ) {
          const i = rows.length;
          const ds = d.toISOString().split("T")[0];
          rows.push({
            date: ds,
            meter_sales: 5200 + i * 95,
            stock_sales: 2100 + i * 40,
            total_income: 7300 + i * 130,
            cashflow_expenses: 750 + i * 12,
            stock_expenses: 420 + i * 8,
            total_expenses: 1170 + i * 20,
            credits: 280 + i * 6,
            net_cashflow: 6130 + i * 110,
            cash_on_hand: 15000 + i * 180,
          });
        }
      }
      if (rows.length === 0) {
        const ds = new Date().toISOString().split("T")[0];
        rows.push({
          date: ds,
          meter_sales: 5000,
          stock_sales: 2000,
          total_income: 7000,
          cashflow_expenses: 700,
          stock_expenses: 400,
          total_expenses: 1100,
          credits: 300,
          net_cashflow: 5900,
          cash_on_hand: 14000,
        });
      }
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
      const totals = keys.reduce((acc, k) => {
        acc[k] = rows.reduce((s, r) => s + (Number(r[k]) || 0), 0);
        return acc;
      }, {});
      return HttpResponse.json({
        data: rows,
        totals,
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
      const shiftId = url.searchParams.get("shift_id");
      const portfolioId = url.searchParams.get("portfolio_id");
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
