import { create } from "zustand";
import {
  addcashflow,
  addPortfolioAPi,
  deletePortfolioAPi,
  updatePortfolioApi,
  updateSalseUnitStatus,
  getCashflow,
  getPortfolio,
  getSales_unit,
  deleteCashflow,
  get_all_cashflow,
  get_global_expense,
  add_MeterReading,
  updateMeterReading,
  deleteSalesUnit,
  getPortfolioListForCredit,
  getIslandShiftSpecificCashflowSummary,
  bulkUpsertCashflow,
  changeMeterReadingStatus,
} from "../src/services/apiService";
import { toast } from "react-hot-toast";

export const usePortfolioStore = create((set) => ({
  portfolioList: [],
  portfoliolistforcredit: [],
  salesProducts: [],
  isPortfolioLoading: false,
  isSalesProductsListLoading: false,
  error: null,
  activeShiftState: null,
  // Fetch portfolio list
  fetchPortfolioList: async (date) => {
    set({ isPortfolioLoading: true, error: null });
    try {
      const portfolioData = await getPortfolio(date);

      // Map object to array
      const portfolioArray = Object.values(portfolioData);

      set({ portfolioList: portfolioArray });
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
      set({ error: error.message, portfolioList: [] });
    } finally {
      set({ isPortfolioLoading: false });
    }
  },
  fetchPortfolioListForCredit: async () => {
    set({ isPortfolioLoading: true, error: null });
    try {
      const portfolioData = await getPortfolioListForCredit();
      set({ portfoliolistforcredit: portfolioData });
    } catch (error) {
      console.error("Error fetching portfolio data:", error);
      set({ error: error.message, portfoliolistforcredit: [] });
    } finally {
      set({ isPortfolioLoading: false });
    }
  },

  // Add portfolio
  addPortfolio: async (portfolio_name) => {
    try {
      await addPortfolioAPi(portfolio_name);
      toast.success("Portfolio added successfully");
    } catch (error) {
      console.error("Error adding portfolio:", error);
      toast.error("Failed to add portfolio");
      throw error;
    }
  },

  // Update portfolio
  updatePortfolio: async (portfolio_id, portfolio_name) => {
    try {
      await updatePortfolioApi(portfolio_id, portfolio_name);
      toast.success("Portfolio updated successfully");
    } catch (error) {
      console.error("Error updating portfolio:", error);
      toast.error("Failed to update portfolio");
      throw error;
    }
  },

  // Delete portfolio
  deletePortfolio: async (id) => {
    set({ error: null, isPortfolioLoading: true }); // Reset error before attempting delete
    try {
      await deletePortfolioAPi(id);
      set((state) => ({
        portfolioList: state.portfolioList.filter(
          (portfolio) => portfolio.id !== id
        ),
      }));
      set({ isPortfolioLoading: false });
      toast.success("Portfolio deleted successfully");
    } catch (error) {
      console.error("Error deleting portfolio:", error);
      set({ error: error.message });
      toast.error("Failed to delete portfolio");
    } finally {
      set({ isPortfolioLoading: false });
    }
  },

  // Fetch Sales Products list
  fetchSalesProductsList: async (portfolio_id, shift_id, date) => {
    set({ isSalesProductsListLoading: true, error: null });
    try {
      const salesProductsData = await getSales_unit(portfolio_id, shift_id, date);
      const mappedData = Object.values(salesProductsData);
      set({ salesProducts: mappedData });
      set({ currentTimeStamp: date });
    } catch (error) {
      console.error("Error fetching Sales Products List:", error);
      set({ error: error.message, salesProducts: [] });
    } finally {
      set({ isSalesProductsListLoading: false });
    }
  },

  addMeterReading: async (newMeterReading) => {
    set({ isSalesProductsListLoading: true, error: null });
    try {
      await add_MeterReading(newMeterReading);
      set((state) => ({
        salesProducts: state.salesProducts.map((product) =>
          product.sales_unit_name === newMeterReading.sales_unit_name
            ? { ...product, ...newMeterReading }
            : product
        ),
      }));
    } catch (error) {
      console.error("Error adding meter reading:", error);
      set({ error: error.message });
    } finally {
      set({ isSalesProductsListLoading: false, error: null });
    }
  },

  updateMeterreading: async (newSalesProduct) => {
    set({ isSalesProductsListLoading: true, error: null });
    try {
      await updateMeterReading(newSalesProduct);
      set((state) => ({
        salesProducts: state.salesProducts.map((product) =>
          product.sales_unit_name === newSalesProduct.sales_unit_name
            ? { ...product, ...newSalesProduct }
            : product
        ),
      }));
    } catch (error) {
      console.error("Error adding Sales Product:", error);
      set({ error: error.message });
    } finally {
      set({ isSalesProductsListLoading: false, error: null });
    }
  },

  // Edit Sales Product
  // editSalesProduct: async (editedSalesProduct) => {
  //   set({ isSalesProductsListLoading: true, error: null });
  //   try {
  //     await addSalesUnit(editedSalesProduct);
  //     set((state) => ({
  //       salesProducts: state.salesProducts.map((product) =>
  //         product.sales_unit_name === editedSalesProduct.sales_unit_name
  //           ? { ...product, ...editedSalesProduct }
  //           : product
  //       ),
  //     })); // Optimistically update state
  //   } catch (error) {
  //     console.error("Error editing Sales Product:", error);
  //     set({ error: error.message });
  //   } finally {
  //     set({ isSalesProductsListLoading: false, error: null });
  //   }
  // },
  deleteSalesUnitstate: async (id) => {
    set({ isSalesProductsListLoading: true, error: null });
    try {
      await deleteSalesUnit(id);
      set((state) => ({
        salesProducts: state.salesProducts.filter(
          (product) => product.id !== id
        ),
      }));
    } catch (error) {
      console.error("Error deleting Sales Unit:", error);
      set({ error: error.message });
    } finally {
      set({ isSalesProductsListLoading: false, error: null });
    }
  },
  updateSalseProductStatus: async (salesUnitName, status) => {
    set({ isSalesProductsListLoading: true, error: null });
    try {
      await updateSalseUnitStatus(salesUnitName, status);
      set((state) => ({
        salesProducts: state.salesProducts.map((product) =>
          product.sales_unit_name === salesUnitName
            ? { ...product, isDiscontinued: !status }
            : product
        ),
      })); // Optimistically update state
    } catch (error) {
      console.error("Error deleting Sales Product:", error);
      set({ error: error.message });
    } finally {
      set({ isSalesProductsListLoading: true, error: null });
    }
  },
  setActiveShiftState: (shift) => {
    set({ activeShiftState: shift });
  },
  updateMeterReadingStatus: async (meterReadingId) => {
    set({ isSalesProductsListLoading: true, error: null });
    try {
      await changeMeterReadingStatus(meterReadingId);
      set((state) => ({
        salesProducts: state.salesProducts.map((product) =>
          product.id === meterReadingId
            ? { ...product, status: product.status === "Active" ? "Discontinued" : "Active" }
            : product
        ),
      }));
      toast.success("Status updated successfully");
    } catch (error) {
      console.error("Error updating meter reading status:", error);
      set({ error: error.message });
      toast.error("Failed to update status");
    } finally {
      set({ isSalesProductsListLoading: false, error: null });
    }
  },
}));

export const useCashflowStore = create((set, get) => ({
  // Data states
  cashflowData: [],
  expenseData: [],
  globalExpenseData: [],
  
  // Loading states - separate for each operation type
  isCashflowLoading: false,
  isExpenseLoading: false,
  isGlobalExpenseLoading: false,
  isSummaryLoading: false,
  
  // Error state
  error: null,
  
  // Summary data
  cashflowSummary: {
    totalSales: 0,
    credit: 0,
    expense: 0,
    netIncome: 0,
    totalCashflow: 0
  },
  
  // Pending operations counter (general loading tracker)
  pendingOperations: 0,
  
  // Update summary total sales
  setTotalSales: (totalSales) =>
    set((state) => ({
      cashflowSummary: { ...state.cashflowSummary, totalSales },
    })),
  
  // Fetch island shift specific cashflow summary
  fetchIslandShiftCashflowSummary: async (date, shift_id, portfolio_id) => {
    set({ isSummaryLoading: true, error: null });
    try {
      const response = await getIslandShiftSpecificCashflowSummary(date, shift_id , portfolio_id);
      set((state) => ({
        cashflowSummary: {
          ...state.cashflowSummary,
          credit: response.credit || 0,
          expense: response.expense || 0,
          netIncome: response.net_income || 0,
          totalCashflow: response.total_cashflow || 0
        },
      }));
      return response;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ isSummaryLoading: false });
    }
  },
  
  // Helper functions to manage loading state
  startOperation: () =>
    set((state) => ({
      pendingOperations: state.pendingOperations + 1,
      isCashflowLoading: true,
    })),
  
  finishOperation: () =>
    set((state) => {
      const newCount = state.pendingOperations - 1;
      return {
        pendingOperations: newCount,
        isCashflowLoading: newCount > 0,
      };
    }),
  
  // Fetch cashflow data
  fetchCashflowData: async (date, shift_id, portfolio_id) => {
    set({ isCashflowLoading: true, error: null });
    try {
      const response = await getCashflow(shift_id,date,portfolio_id);
      // Convert object to array
      const cashflowArray = Object.keys(response).map((key) => response[key]);
      // Now cashflowArray can be passed directly to BaseTable
      set({ cashflowData: cashflowArray });
    } catch (error) {
      set({ error: error.message, cashflowData: [] });
    } finally {
      set({ isCashflowLoading: false });
    }
  },
  
  fetchAllCashflow: async () => {
    set({ isCashflowLoading: true, error: null });
    try {
      const response = await get_all_cashflow();
      set({ cashflowData: response });
    } catch (error) {
      set({ error: error.message, cashflowData: [] });
    } finally {
      set({ isCashflowLoading: false });
    }
  },
  
  fetchGlobalExpense: async () => {
    set({ isGlobalExpenseLoading: true, error: null });
    try {
      const response = await get_global_expense();
      const globalExpenseArray = Object.keys(response).map((key) => response[key]);
      set({ globalExpenseData: globalExpenseArray });
    } catch (error) {
      set({ error: error.message, globalExpenseData: [] });
    } finally {
      set({ isGlobalExpenseLoading: false });
    }
  },
  
  BulkUpsertCashflow: async (cashflow) => {
    const previousData = get().cashflowData;
    get().startOperation();
    try {
      await bulkUpsertCashflow(cashflow);
      set((state) => ({
        cashflowData: [...state.cashflowData, ...cashflow],
      }));
    } catch (error) {
      set({ cashflowData: previousData, error: error.message });
    } finally {
      get().finishOperation();
    }
  },
  
  deleteCashflow: async (id) => {
    const previousData = get().cashflowData;
    get().startOperation();
    
    try {
      await deleteCashflow(id);
      
      set((state) => ({
        cashflowData: state.cashflowData.filter(
          (cashflow) => cashflow.id !== id
        ),
      }));
    } catch (error) {
      set({ cashflowData: previousData, error: error.message });
    } finally {
      get().finishOperation();
    }
  },
}));