import { create } from "zustand";
import {
  getCashflowByDateAndPortfolioApi,
  getAllCashflowApi,
  addExpenseApi,
  updateExpenseApi,
  upsertCashflowApi,
  deleteCashflowApi,
  deleteAllCashflowByDateApi
} from "../src/pages/Cashflow/API/apiService";

export const useCashflowStore = create((set, get) => ({
  cashflowData: {},
  allCashflow: [],
  loading: false,
  error: null,
  currentPortfolioId: null,
  currentShiftId: null,
  currentDate: null,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  
  // Set current context
  setCurrentContext: (portfolioId, shiftId, date) => set({ 
    currentPortfolioId: portfolioId,
    currentShiftId: shiftId,
    currentDate: date
  }),

  // Fetch cashflow by portfolio, shift, and date
  fetchCashflowByPortfolio: async (portfolioId, shiftId, date) => {
    set({ loading: true, error: null });
    try {
      const response = await getCashflowByDateAndPortfolioApi(portfolioId, shiftId, date);
      set({
        cashflowData: response.data || {},
        currentPortfolioId: portfolioId,
        currentShiftId: shiftId,
        currentDate: date
      });
      return response.data;
    } catch (error) {
      set({ error: error.message });
      console.error("Error fetching cashflow data:", error);
      return {};
    } finally {
      set({ loading: false });
    }
  },

  // Get all cashflow data
  fetchAllCashflow: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getAllCashflowApi();
      set({ allCashflow: data || [] });
      return data;
    } catch (error) {
      set({ error: error.message });
      console.error("Error fetching all cashflow data:", error);
      return [];
    } finally {
      set({ loading: false });
    }
  },

  // Add expense
  addExpense: async (expenseData) => {
    set({ loading: true, error: null });
    try {
      const response = await addExpenseApi(expenseData);
      // If we have the current context matching, refresh the data
      const { currentPortfolioId, currentShiftId, currentDate } = get();
      if (
        currentPortfolioId === expenseData.portfolio_id && 
        currentDate === expenseData.date
      ) {
        await get().fetchCashflowByPortfolio(
          currentPortfolioId, 
          currentShiftId, 
          currentDate
        );
      }
      return response;
    } catch (error) {
      set({ error: error.message });
      console.error("Error adding expense:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Update expense
  updateExpense: async (expenseData) => {
    set({ loading: true, error: null });
    try {
      const response = await updateExpenseApi(expenseData);
      // If we have the current context matching, refresh the data
      const { currentPortfolioId, currentShiftId, currentDate } = get();
      if (
        currentPortfolioId === expenseData.portfolio_id && 
        currentDate === expenseData.date
      ) {
        await get().fetchCashflowByPortfolio(
          currentPortfolioId, 
          currentShiftId, 
          currentDate
        );
      }
      return response;
    } catch (error) {
      set({ error: error.message });
      console.error("Error updating expense:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Bulk upsert cashflow entries
  upsertCashflow: async (cashflowItems) => {
    set({ loading: true, error: null });
    try {
      const response = await upsertCashflowApi(cashflowItems);
      // If we have the current context, refresh the data
      const { currentPortfolioId, currentShiftId, currentDate } = get();
      if (currentPortfolioId && currentShiftId && currentDate) {
        await get().fetchCashflowByPortfolio(
          currentPortfolioId, 
          currentShiftId, 
          currentDate
        );
      }
      return response;
    } catch (error) {
      set({ error: error.message });
      console.error("Error upserting cashflow:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Delete cashflow entry
  deleteCashflow: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await deleteCashflowApi(id);
      // If we have the current context, refresh the data
      const { currentPortfolioId, currentShiftId, currentDate } = get();
      if (currentPortfolioId && currentShiftId && currentDate) {
        await get().fetchCashflowByPortfolio(
          currentPortfolioId, 
          currentShiftId, 
          currentDate
        );
      }
      return response;
    } catch (error) {
      set({ error: error.message });
      console.error("Error deleting cashflow:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Delete all cashflow for a date and portfolio
  deleteAllCashflow: async (date, portfolioId) => {
    set({ loading: true, error: null });
    try {
      const response = await deleteAllCashflowByDateApi(date, portfolioId);
      // If we have the current context matching, refresh the data
      const { currentPortfolioId, currentShiftId, currentDate } = get();
      if (
        currentPortfolioId === portfolioId && 
        currentDate === date
      ) {
        await get().fetchCashflowByPortfolio(
          currentPortfolioId, 
          currentShiftId, 
          currentDate
        );
      }
      return response;
    } catch (error) {
      set({ error: error.message });
      console.error("Error deleting all cashflow entries:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Format data for different views
  getFormattedCashflowByMode: () => {
    const { cashflowData } = get();
    // Group cashflow by mode
    const byMode = {};
    
    if (!cashflowData || Object.keys(cashflowData).length === 0) {
      return byMode;
    }
    
    Object.values(cashflowData).forEach(entry => {
      if (!byMode[entry.mode]) {
        byMode[entry.mode] = [];
      }
      byMode[entry.mode].push(entry);
    });
    
    return byMode;
  },
  
  // Clear current cashflow data
  clearCashflowData: () => set({ 
    cashflowData: {},
    currentPortfolioId: null,
    currentShiftId: null,
    currentDate: null
  }),
  
  // Reset the store
  resetStore: () => set({ 
    cashflowData: {},
    allCashflow: [],
    loading: false,
    error: null,
    currentPortfolioId: null,
    currentShiftId: null,
    currentDate: null
  }),
})); 