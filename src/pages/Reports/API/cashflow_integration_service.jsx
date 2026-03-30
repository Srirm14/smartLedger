import axios from "axios";
import { useAuthStore } from "../../../../store/useAuthStore";
import { axios401RefreshInterceptor } from "@/services/axiosRefreshOn401.js";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper functions to get tokens from Zustand store
const getToken = () => {
  const { accessToken } = useAuthStore.getState();
  return accessToken;
};

// Interceptor to attach token to requests
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  axios401RefreshInterceptor(axiosInstance)
);

/**
 * Get comprehensive cashflow summary for a specific date
 * Integrates meter readings, stock transactions, expenses, and credit
 */
export const getCashflowSummary = async (date) => {
  try {
    const response = await axiosInstance.get(`/report/cashflow_summary/get/${date}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch cashflow summary", error);
    throw error;
  }
};

/**
 * Get detailed outbound stock transactions for a specific date
 * Can be filtered by portfolio_id (optional)
 */
export const getOutboundStockSummary = async (date, portfolioId = null) => {
  try {
    const endpoint = portfolioId 
      ? `/report/outbound_stock_summary/get/${date}?portfolio_id=${portfolioId}`
      : `/report/outbound_stock_summary/get/${date}`;
    
    const response = await axiosInstance.get(endpoint);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch outbound stock data", error);
    throw error;
  }
};

/**
 * Get integrated cashflow report for a date range
 * Shows day-by-day breakdown of all financial components
 */
export const getIntegratedCashflowReport = async (startDate, endDate) => {
  try {
    const response = await axiosInstance.get(`/report/integrated_cashflow_report/get/${startDate}/${endDate}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch integrated cashflow report", error);
    throw error;
  }
};

/**
 * Get portfolio-specific cashflow data for a specific date
 */
export const getPortfolioCashflow = async (date, portfolioId) => {
  try {
    const response = await axiosInstance.get(`/report/island_shift_specific_cashflow_summary/get/?date=${date}&shift_id=${portfolioId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch portfolio cashflow data", error);
    throw error;
  }
};