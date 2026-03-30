import { create } from "zustand";
import { getCashflowTransactionsApi } from "../src/pages/Cashflow/API/apiService";

export const useTransactionLedgerStore = create((set, get) => ({
  // Store state
  transactions: [],
  summary: {
    totalIncome: 0,
    totalExpense: 0,
    netCashflow: 0
  },
  loading: false,
  error: null,
  
  // Filter state
  filters: {
    startDate: null,
    endDate: null,
    portfolioId: null,
    shiftId: null,
    mode: null,
    type: null
  },
  
  // Set loading state
  setLoading: (loading) => set({ loading }),
  
  // Set error state
  setError: (error) => set({ error }),
  
  // Update filters
  updateFilters: (newFilters) => set((state) => ({
    filters: {
      ...state.filters,
      ...newFilters
    }
  })),
  
  // Reset filters but preserve date range
  resetFilters: () => set((state) => ({
    filters: {
      // Preserve date filters
      startDate: state.filters.startDate,
      endDate: state.filters.endDate,
      // Reset other filters
      portfolioId: null,
      shiftId: null,
      mode: null,
      type: null
    }
  })),
  
  // Fetch transactions based on current filters
  fetchTransactions: async () => {
    set({ loading: true, error: null });
    try {
      const filters = get().filters;
      const response = await getCashflowTransactionsApi(filters);
      
      if (response.success) {
        set({
          transactions: response.data.transactions || [],
          summary: {
            totalIncome: response.data.summary.total_income || 0,
            totalExpense: response.data.summary.total_expense || 0,
            netCashflow: response.data.summary.net_cashflow || 0
          }
        });
      } else {
        throw new Error(response.message || "Failed to fetch transactions");
      }
    } catch (error) {
      set({ error: error.message });
      console.error("Error fetching transactions:", error);
    } finally {
      set({ loading: false });
    }
  },
  
  // Get filtered transactions
  getFilteredTransactions: () => {
    const { transactions } = get();
    return transactions;
  },
  
  // Get unique values for filter dropdowns
  getFilterOptions: () => {
    const { transactions } = get();
    
    // Create a Map to deduplicate portfolios while preserving their structure
    const portfolioMap = new Map();
    transactions
      .filter(t => t.portfolio_id && t.portfolio_name)
      .forEach(t => {
        portfolioMap.set(t.portfolio_id, {
          id: t.portfolio_id,
          name: t.portfolio_name
        });
      });
    const portfolios = Array.from(portfolioMap.values());
      
    const modes = [...new Set(transactions
      .filter(t => t.mode)
      .map(t => t.mode))];
      
    const types = [...new Set(transactions
      .filter(t => t.type)
      .map(t => t.type))];
      
    const bankAccountMap = new Map();
    transactions
      .filter(t => t.bank_account && t.bank_name)
      .forEach(t => {
        bankAccountMap.set(t.bank_account, {
          name: t.bank_account,
          bankName: t.bank_name
        });
      });
    const bankAccounts = Array.from(bankAccountMap.values());
      
    return {
      portfolios,
      modes,
      types,
      bankAccounts
    };
  },
  
  // Clear transaction data
  clearTransactions: () => set({
    transactions: [],
    summary: {
      totalIncome: 0,
      totalExpense: 0,
      netCashflow: 0
    }
  }),
  
  // Reset store
  resetStore: () => set({
    transactions: [],
    summary: {
      totalIncome: 0,
      totalExpense: 0,
      netCashflow: 0
    },
    loading: false,
    error: null,
    filters: {
      startDate: null,
      endDate: null,
      portfolioId: null,
      shiftId: null,
      mode: null,
      type: null
    }
  })
})); 