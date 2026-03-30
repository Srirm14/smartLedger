import axios from "axios";
import { useAuthStore } from "../../../../store/useAuthStore";
import { axios401RefreshInterceptor } from "@/services/axiosRefreshOn401.js";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Create axios instance with base URL and default headers
const axiosInstance = axios.create({
  baseURL: BASE_URL ,
  headers: {
    "Content-Type": "application/json",
  },
});
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
  
// Cashflow API endpoints
export const getCashflowTransactionsApi = async (filters = {}) => {
  try {
    const { startDate, endDate, portfolioId, shiftId, mode, type } = filters;
    
    const params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (portfolioId) params.portfolio_id = portfolioId;
    if (shiftId) params.shift_id = shiftId;
    if (mode) params.mode = mode;
    if (type) params.type = type;
    
    const response = await axiosInstance.get("/cashflow/transaction_ledger", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching cashflow transactions:", error);
    console.error("Error details:", error.response?.data);
    
    // Return a structured error response
    return {
      success: false,
      message: error.response?.data?.detail || "Failed to fetch cashflow transactions",
      data: {
        transactions: [],
        summary: {
          total_income: 0,
          total_expense: 0,
          net_cashflow: 0
        }
      }
    };
  }
};

export const getCashflowByDateAndPortfolioApi = async (portfolioId, shiftId, date) => {
  try {
    const response = await axiosInstance.get(`/cashflow/${portfolioId}/get`, {
      params: {
        shift_id: shiftId,
        date: date
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching cashflow data:", error);
    throw new Error(error.response?.data?.detail || "Failed to fetch cashflow data");
  }
};

export const getAllCashflowApi = async () => {
  try {
    const response = await axiosInstance.get("/cashflow/get_all_cashflow");
    return response.data;
  } catch (error) {
    console.error("Error fetching all cashflow data:", error);
    throw new Error(error.response?.data?.detail || "Failed to fetch all cashflow data");
  }
};

export const addExpenseApi = async (expenseData) => {
  try {
    const response = await axiosInstance.post("/cashflow/expense/add", expenseData);
    return response.data;
  } catch (error) {
    console.error("Error adding expense:", error);
    throw new Error(error.response?.data?.detail || "Failed to add expense");
  }
};

export const updateExpenseApi = async (expenseData) => {
  try {
    const response = await axiosInstance.post("/cashflow/expense/update", expenseData);
    return response.data;
  } catch (error) {
    console.error("Error updating expense:", error);
    throw new Error(error.response?.data?.detail || "Failed to update expense");
  }
};

export const upsertCashflowApi = async (cashflowBulkData) => {
  try {
    const response = await axiosInstance.post("/cashflow/upsert", {
      cashflow: cashflowBulkData
    });
    return response.data;
  } catch (error) {
    console.error("Error upserting cashflow:", error);
    throw new Error(error.response?.data?.detail || "Failed to upsert cashflow");
  }
};

export const deleteCashflowApi = async (id) => {
  try {
    const response = await axiosInstance.delete(`/cashflow/delete`, {
      params: { id }
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting cashflow:", error);
    throw new Error(error.response?.data?.detail || "Failed to delete cashflow");
  }
};

export const deleteAllCashflowByDateApi = async (date, portfolioId) => {
  try {
    const response = await axiosInstance.delete(`/cashflow/delete_all`, {
      params: { 
        date,
        portfolio_id: portfolioId
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting all cashflow entries:", error);
    throw new Error(error.response?.data?.detail || "Failed to delete all cashflow entries");
  }
};

export const getGlobalEntriesApi = async () => {
  try {
    const response = await axiosInstance.get("/cashflow/global_entries");
    return response.data;
  } catch (error) {
    console.error("Error fetching global entries:", error);
    throw new Error(error.response?.data?.detail || "Failed to fetch global entries");
  }
};

