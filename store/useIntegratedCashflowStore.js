import { create } from "zustand";
import { 
  getCashflowSummary, 
  getOutboundStockSummary,
  getIntegratedCashflowReport,
  getPortfolioCashflow
} from "@/pages/Reports/API/cashflow_integration_service";

/**
 * Enhanced Cashflow Store that integrates all financial components:
 * - Income from meter readings (fuel and other sales)
 * - Income from stock transactions (outbound)
 * - Expenses (cashflow table and stock inbound)
 * - Credit transactions
 * - Portfolio-specific breakdowns
 */
export const useIntegratedCashflowStore = create((set, get) => ({
  // State
  cashflowSummary: null,
  outboundStockData: [],
  integratedReport: {
    data: [],
    totals: {},
    dateRange: {}
  },
  portfolioCashflow: {},
  
  // Loading states
  cashflowSummaryLoading: false,
  outboundStockLoading: false,
  integratedReportLoading: false,
  portfolioCashflowLoading: false,
  
  // Error states
  cashflowSummaryError: null,
  outboundStockError: null,
  integratedReportError: null,
  portfolioCashflowError: null,
  
  // Actions
  /**
   * Fetch comprehensive cashflow summary for a specific date
   */
  fetchCashflowSummary: async (date) => {
    if (!date) return;
    
    set({ 
      cashflowSummaryLoading: true,
      cashflowSummaryError: null
    });
    
    try {
      const data = await getCashflowSummary(date);
      set({ cashflowSummary: data });
    } catch (error) {
      console.error("Error fetching cashflow summary:", error);
      set({ cashflowSummaryError: error.message || "Failed to fetch cashflow summary" });
    } finally {
      set({ cashflowSummaryLoading: false });
    }
  },
  
  /**
   * Fetch outbound stock transactions for a specific date
   */
  fetchOutboundStockData: async (date, portfolioId = null) => {
    if (!date) return;
    
    set({ 
      outboundStockLoading: true,
      outboundStockError: null
    });
    
    try {
      const response = await getOutboundStockSummary(date, portfolioId);
      set({ outboundStockData: response.data || [] });
    } catch (error) {
      console.error("Error fetching outbound stock data:", error);
      set({ outboundStockError: error.message || "Failed to fetch outbound stock data" });
    } finally {
      set({ outboundStockLoading: false });
    }
  },
  
  /**
   * Fetch integrated cashflow report for a date range
   */
  fetchIntegratedReport: async (startDate, endDate) => {
    if (!startDate || !endDate) return;
    
    set({ 
      integratedReportLoading: true,
      integratedReportError: null
    });
    
    try {
      const response = await getIntegratedCashflowReport(startDate, endDate);
      
      set({ 
        integratedReport: {
          data: response.data || [],
          totals: response.totals || {},
          dateRange: response.date_range || {}
        }
      });
    } catch (error) {
      console.error("Error fetching integrated cashflow report:", error);
      set({ integratedReportError: error.message || "Failed to fetch integrated report" });
    } finally {
      set({ integratedReportLoading: false });
    }
  },
  
  /**
   * Fetch portfolio-specific cashflow data
   */
  fetchPortfolioCashflow: async (date, portfolioId) => {
    if (!date || !portfolioId) return;
    
    set({ 
      portfolioCashflowLoading: true,
      portfolioCashflowError: null
    });
    
    try {
      const data = await getPortfolioCashflow(date, portfolioId);
      set({ portfolioCashflow: data });
    } catch (error) {
      console.error("Error fetching portfolio cashflow:", error);
      set({ portfolioCashflowError: error.message || "Failed to fetch portfolio cashflow" });
    } finally {
      set({ portfolioCashflowLoading: false });
    }
  },
  
  /**
   * Reset all store state 
   */
  resetStore: () => {
    set({
      cashflowSummary: null,
      outboundStockData: [],
      integratedReport: {
        data: [],
        totals: {},
        dateRange: {}
      },
      portfolioCashflow: {},
      cashflowSummaryLoading: false,
      outboundStockLoading: false,
      integratedReportLoading: false,
      portfolioCashflowLoading: false,
      cashflowSummaryError: null,
      outboundStockError: null,
      integratedReportError: null,
      portfolioCashflowError: null
    });
  }
}));