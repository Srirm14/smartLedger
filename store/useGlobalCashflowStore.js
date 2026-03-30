import { getCashflowHeaderOverview, getCategoryWiseExpenseCashflow, getIslandWiseIncomeCashflow, getProductWiseIncomeCashflow } from "@/pages/Reports/API/apiservice";
import { getPortfolioListForCredit } from "@/services/apiService";
import { create } from "zustand";


export const useGlobalCashflowStore = create((set) => ({
  cashflowHeaderOverview: [],
  GlobalCashflowHeaderLoading: false,
  IncomeCashflow: {
    island: [],
    product: [],
  },
  ExpenseCashflow: [],
  GlobalExpenseCashflowLoading: false,
  GlobalIncomeCashflowLoading: false,
  setCashflowHeaderOverview: (cashflowHeaderOverview) => set({ cashflowHeaderOverview }),
  setGlobalCashflowHeaderLoading: (GlobalCashflowHeaderLoading) => set({ GlobalCashflowHeaderLoading }),
  setIslandWiseIncomeCashflow: (islandWiseIncomeCashflow) => set({ islandWiseIncomeCashflow }),
  setGlobalIslandWiseIncomeCashflowLoading: (GlobalIslandWiseIncomeCashflowLoading) => set({ GlobalIslandWiseIncomeCashflowLoading }),
  setCategoryWiseExpenseCashflow: (categoryWiseExpenseCashflow) => set({ categoryWiseExpenseCashflow }),
  setGlobalCategoryWiseExpenseCashflowLoading: (GlobalCategoryWiseExpenseCashflowLoading) => set({ GlobalCategoryWiseExpenseCashflowLoading }),
  fetchCashflowHeaderOverview: async (date) => {
    set({ GlobalCashflowHeaderLoading: true });
    try {
      const data = await getCashflowHeaderOverview(date); 
      const portfolioData = await getPortfolioListForCredit(date)

      const summaryData = [
        {
          title: "Total Income",
          value: `₹${data.income.total_income}` || 0,
          breakdown: data.income.breakdown,
        },
        {
          title: "Total Expense",
          value: `₹${data.expense.total_expense}` || 0,
          breakdown: data.expense.breakdown,
        },
        {
          title: "Total Net Cashflow",
          value: `₹${data.net_income}` || 0,
        },
      ];
      function ensureAllPortfoliosInBreakdown(breakdown) {
        const updatedBreakdown = {};
      
        portfolioData.forEach((portfolio) => {
          const portfolioName = portfolio.portfolio_name;
          updatedBreakdown[portfolioName] = breakdown[portfolioName] || 0;
        });
      
        return updatedBreakdown;
      }
      summaryData.forEach((item) => {
        if (item.breakdown) {
          item.breakdown = ensureAllPortfoliosInBreakdown(item.breakdown);
        }
      });

      set({ cashflowHeaderOverview: summaryData });
    } catch (error) {
      console.error("Error fetching cashflow header overview", error);
    } finally {
      set({ GlobalCashflowHeaderLoading: false });
    }
  },
  fetchIncomeCashflow: async (date) => {
    set({ GlobalIncomeCashflowLoading: true });
    try {
      const data = await getIslandWiseIncomeCashflow(date);
      const productData = await getProductWiseIncomeCashflow(date);
      const islands = Object.entries(data).map(([key, value]) => {
        const products = Object.entries(value)
          .filter(([product]) => product !== "total_sales")
          .map(([product, details]) => ({
        name: product,
        sales: `₹${details.sales.toLocaleString()}`,
        category: details.category
      }));
    return {
      name: key,
      income: `₹${value.total_sales.toLocaleString()}`,
      products
        };
      });
      set({ IncomeCashflow: { island: islands, product: productData } });
    } catch (error) {
      console.error("Error fetching island wise income cashflow", error);
    } finally {
      set({ GlobalIncomeCashflowLoading: false });
    }
  },
  fetchCategoryWiseExpenseCashflow: async (date) => {
    set({ GlobalExpenseCashflowLoading: true });
    try {
      const data = await getCategoryWiseExpenseCashflow(date);
      set({ ExpenseCashflow: data });
    } catch (error) {
      console.error("Error fetching category wise expense cashflow", error);
    } finally {
      set({ GlobalExpenseCashflowLoading: false });
    }
  }
}))