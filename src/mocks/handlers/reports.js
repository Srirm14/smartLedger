import { http, HttpResponse } from "msw";
import { delayGet } from "../utils.js";

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

function categoryExpense() {
  return ["Rent", "Utilities", "Payroll", "Maintenance", "Supplies"].map(
    (cat, i) => ({
      category: cat,
      amount: 400 + i * 150,
      portfolio_breakdown: portfolioNames.reduce((acc, n, j) => {
        acc[n] = 50 + i * 10 + j * 5;
        return acc;
      }, {}),
    })
  );
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
    return HttpResponse.json(categoryExpense());
  }),

  http.get("*/report/cashflow_summary/get/:date", async () => {
    await delayGet();
    return HttpResponse.json({
      total_income: 22000,
      total_expense: 7500,
      net: 14500,
      by_portfolio: islandWiseIncome(),
    });
  }),

  http.get("*/report/outbound_stock_summary/get/:date", async ({ request }) => {
    await delayGet();
    const url = new URL(request.url);
    const pid = url.searchParams.get("portfolio_id");
    return HttpResponse.json({
      rows: Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        portfolio_id: pid ? Number(pid) : 1,
        quantity: 10 + i,
        product: `SKU-${i + 1}`,
      })),
    });
  }),

  http.get(
    "*/report/integrated_cashflow_report/get/:start/:end",
    async () => {
      await delayGet();
      return HttpResponse.json({
        days: Array.from({ length: 20 }, (_, i) => ({
          date: `2026-03-${String((i % 28) + 1).padStart(2, "0")}`,
          income: 1000 + i * 20,
          expense: 300 + i * 5,
        })),
      });
    }
  ),

  http.get(
    /.*\/report\/island_shift_specific_cashflow_summary\/get\/?$/,
    async ({ request }) => {
      await delayGet();
      const url = new URL(request.url);
      const date = url.searchParams.get("date") || "";
      const shiftId = url.searchParams.get("shift_id");
      const portfolioId = url.searchParams.get("portfolio_id");
      return HttpResponse.json({
        net_income: 4200 + (Number(portfolioId) || 1) * 10,
        expense: 800,
        credit: 250,
        total_cashflow: 5000,
        total_sales: 6000,
        date,
        shift_id: shiftId,
        portfolio_id: portfolioId,
      });
    }
  ),
];
