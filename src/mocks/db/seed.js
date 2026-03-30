/**
 * In-memory mock DB — mutated by MSW handlers. Reset on full page reload.
 */

import { DEMO_ORGANISATION_NAME, DEMO_USER_EMAIL, DEMO_USER_NAME } from "../demo.js";
import { CASHFLOW_CATEGORIES } from "../../pages/constants.js";

const portfolioNames = [
  "North Island",
  "South Pier",
  "East Dock",
  "West Bay",
  "Central Hub",
];

const shifts = ["Morning", "Evening", "Night"];

const productCategories = ["Fuel", "Lubricant", "Retail", "Services", "Misc"];

function buildProducts() {
  const products = {};
  for (let i = 1; i <= 20; i++) {
    products[i] = {
      id: i,
      product: `SKU-${String(i).padStart(3, "0")} Premium`,
      price: 2.5 + i * 0.15,
      uom: i % 3 === 0 ? "Gal" : "L",
      category: productCategories[i % productCategories.length],
      discontinued: i % 11 === 0,
      created_at: new Date(2024, (i % 12) + 1, (i % 28) + 1).toISOString(),
    };
  }
  return products;
}

function buildPortfolio() {
  const out = {};
  let id = 1;
  for (const name of portfolioNames) {
    for (const shift of shifts) {
      out[id] = {
        id,
        portfolio_id: portfolioNames.indexOf(name) + 1,
        portfolio_name: name,
        shift_name: shift,
        shift_id: id,
        total_sales: 5000 + id * 120,
        total_items: 40 + id * 2,
        overall_payment_received: 4200 + id * 100,
        credit: 300 + id * 15,
      };
      id++;
    }
  }
  while (id <= 20) {
    out[id] = {
      id,
      portfolio_id: 6,
      portfolio_name: "Overflow Station",
      shift_name: `Shift-${id}`,
      shift_id: id,
      total_sales: 2000 + id * 50,
      total_items: 25,
      overall_payment_received: 1800 + id * 40,
      credit: 150,
    };
    id++;
  }
  return out;
}

function buildCustomers() {
  const customers = {};
  for (let i = 1; i <= 20; i++) {
    const nm = `Customer ${i} Ltd`;
    customers[i] = {
      id: i,
      name: nm,
      customer_name: nm,
      email: `fleet${i}@example.com`,
      contact_phone: `+1555000${String(i).padStart(4, "0")}`,
      credit_limit: 5000 + i * 250,
      is_active: i % 7 !== 0,
      balance: i * 42.5,
    };
  }
  return customers;
}

function buildEmployees() {
  const roles = ["Manager", "Cashier", "Operator", "Supervisor"];
  return Array.from({ length: 18 }, (_, i) => ({
    id: i + 1,
    name: `Employee ${i + 1}`,
    role: roles[i % roles.length],
    contact_number: `555${String(1000 + i)}`,
    employee_id: `EMP-${100 + i}`,
    email: `emp${i + 1}@demo.local`,
    salary: 35000 + i * 800,
  }));
}

function buildVehicles(customers) {
  const vehicles = [];
  let vid = 1;
  for (let cid = 1; cid <= 20; cid++) {
    for (let v = 0; v < 2; v++) {
      vehicles.push({
        id: vid++,
        customer_id: cid,
        vehicle_number: `ABC-${1000 + vid}`,
        type: v ? "Truck" : "Van",
      });
    }
  }
  return vehicles;
}

function pickCashflowCategory(index, type) {
  const income = CASHFLOW_CATEGORIES.income;
  const expense = CASHFLOW_CATEGORIES.expense;
  if (type === "net income") return income[index % income.length];
  return expense[index % expense.length];
}

function buildMeterReadings(portfolioRows, date, products) {
  const out = {};
  let id = 1;
  for (const row of Object.values(portfolioRows)) {
    const productId = (id % 20) + 1;
    const prod = products[productId] || {
      product: `SKU-${String(productId).padStart(3, "0")} Premium`,
      price: 2.5 + productId * 0.15,
      uom: "L",
      category: "Fuel",
    };
    const uiCategory = prod.category === "Fuel" ? "Fuel" : "Others";
    const soldQty = 30 + (id % 40) + 10;
    const opening = 10000 + id * 50;
    const closing = opening + soldQty;
    const discontinued = id % 5 === 0;
    out[id] = {
      id,
      sales_unit_name: `Pump-${row.shift_id}-${id}`,
      portfolio_id: row.portfolio_id,
      shift_id: row.shift_id,
      product_id: productId,
      product_name: prod.product,
      price: prod.price,
      uom: prod.uom,
      category: uiCategory,
      opening_reading: opening,
      closing_reading: closing,
      sold_quantity: soldQty,
      meter_reading: closing,
      status: discontinued ? "Discontinued" : "Active",
      discontinued,
      date,
    };
    id++;
    if (id > 22) break;
  }
  return out;
}

function buildCashflowEntries(shiftId, portfolioId, date) {
  const entries = {};
  for (let i = 1; i <= 18; i++) {
    const type = i % 2 === 1 ? "net income" : "expense";
    const category = pickCashflowCategory(i, type);
    entries[i] = {
      id: i,
      shift_id: shiftId,
      portfolio_id: portfolioId,
      date,
      mode: i % 2 ? "Cash" : "Card",
      amount: 50 + i * 12,
      category,
      description: `${category} — shift ${shiftId}`,
      type,
    };
  }
  return entries;
}

function buildCreditRows(customers, portfolioRows) {
  const today = new Date().toISOString().split("T")[0];
  const plist = Object.values(portfolioRows);
  const data = {};
  for (let i = 1; i <= 20; i++) {
    const c = customers[(i % 20) + 1];
    const pr = plist[i % plist.length];
    const p1 = 10 + i * 0.5;
    const p2 = 12 + i * 0.25;
    const q1 = 2 + (i % 4);
    const q2 = 1 + (i % 3);
    const a1 = p1 * q1;
    const a2 = p2 * q2;
    data[String(i)] = {
      id: i,
      date: today,
      customer_id: c.id,
      customer_name: c.customer_name,
      vehicle_no: `VH-${1000 + i}`,
      portfolio_name: pr.portfolio_name,
      shift_name: pr.shift_name,
      shift_id: pr.shift_id,
      product_name: [`SKU-${String(i).padStart(3, "0")} Premium`, `SKU-${String((i % 20) + 1).padStart(3, "0")} Plus`],
      price: [p1, p2],
      quantity: [q1, q2],
      uom: ["L", "L"],
      amount: [a1, a2],
      total_amount: a1 + a2,
    };
  }
  return {
    data,
    total_count: 20,
    page: 1,
    page_size: 20,
  };
}

function buildVehiclesGroupedByCustomer(vehicles) {
  const data = {};
  for (const v of vehicles) {
    const k = String(v.customer_id);
    if (!data[k]) data[k] = [];
    data[k].push({
      ...v,
      vehicle_no: v.vehicle_number,
    });
  }
  return data;
}

function buildShiftConfigRows() {
  const out = {};
  let id = 1;
  for (let pi = 0; pi < portfolioNames.length; pi++) {
    const pname = portfolioNames[pi];
    for (const shift of shifts) {
      out[String(id)] = {
        portfolio: pi + 1,
        portfolio_id: pi + 1,
        portfolio_name: pname,
        shift_id: id,
        shift_name: shift,
        shift_start_time: "06:00",
        shift_end_time: "14:00",
        start_date: "2024-01-01",
        end_date: "9999-12-31",
        shift_start_timestamp: null,
        active: true,
        day_span: 1,
      };
      id++;
    }
  }
  return out;
}

export function createSeedState() {
  const today = new Date().toISOString().split("T")[0];
  const products = buildProducts();
  const portfolio = buildPortfolio();
  const customers = buildCustomers();
  const vehicles = buildVehicles(customers);
  const employees = buildEmployees();

  const state = {
    productsByDate: {},
    portfolioByDate: {},
    meterByKey: {},
    cashflowByKey: {},
    customers,
    vehicles,
    employees,
    creditRecords: buildCreditRows(customers, portfolio),
    vehiclesGrouped: buildVehiclesGroupedByCustomer(vehicles),
    shiftConfigRows: buildShiftConfigRows(),
    bankAccounts: [
      { id: 1, bank_name: "Demo National Bank" },
      { id: 2, bank_name: "Harbor Credit Union" },
    ],
    modes: [
      { id: 1, mode_name: "Cash", associated_account: 1 },
      { id: 2, mode_name: "Card", associated_account: 1 },
      { id: 3, mode_name: "Transfer", associated_account: 2 },
    ],
    shiftsConfig: {},
    meterReadingsAll: Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      label: `MR-${i + 1}`,
      value: 1000 + i * 50,
    })),
    organisation: { name: DEMO_ORGANISATION_NAME, id: 1 },
    user: {
      id: 1,
      email: DEMO_USER_EMAIL,
      username: "demo",
      name: DEMO_USER_NAME,
      organisation_id: 1,
    },
    globalExpense: {
      1: { id: 1, name: "Rent", amount: 2000 },
      2: { id: 2, name: "Utilities", amount: 450 },
    },
    allCashflow: [],
    stockItems: [],
    transactionsByCustomer: {},
    tallyCache: {},
    stockTransactionHistoryByStockId: {},
    stockMeterHistoryByStockId: {},
    stockLinkedUnitsByStockId: {},
  };

  state.productsByDate[today] = { ...products };
  state.portfolioByDate[today] = { ...portfolio };

  const p1 = portfolio["1"];
  const meterKey = `${p1.portfolio_id}_${p1.shift_id}_${today}`;
  state.meterByKey[meterKey] = buildMeterReadings(portfolio, today, products);
  for (const row of Object.values(portfolio).slice(0, 8)) {
    const k = `${row.portfolio_id}_${row.shift_id}_${today}`;
    state.meterByKey[k] = buildMeterReadings(portfolio, today, products);
    state.cashflowByKey[k] = buildCashflowEntries(row.shift_id, row.portfolio_id, today);
  }

  for (let d = 1; d <= 15; d++) {
    const ds = `2026-03-${String(d).padStart(2, "0")}`;
    state.productsByDate[ds] = { ...products };
    state.portfolioByDate[ds] = { ...portfolio };
  }

  for (let i = 1; i <= 20; i++) {
    const qty = 100 + i * 3;
    state.stockItems.push({
      id: i,
      stock_name: `Storage Tank ${i}`,
      product_name: `SKU-${String(i).padStart(3, "0")} Premium`,
      name: `Stock Item ${i}`,
      quantity: qty,
      total_stock: qty,
      low_stock_limit: 20,
      alert_enabled: i % 4 === 0,
      uom: i % 2 === 0 ? "L" : "Gal",
      type: "Bulk",
      capacity: 8000 + i * 200,
    });
  }

  for (let cid = 1; cid <= 10; cid++) {
    state.transactionsByCustomer[cid] = [
      { id: cid * 10 + 1, amount: 120, date: today, type: "payment" },
      { id: cid * 10 + 2, amount: 80, date: today, type: "charge" },
    ];
  }

  return state;
}
