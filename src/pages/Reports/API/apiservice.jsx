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


export const getCashflowHeaderOverview = async (date) => {
    try {
        const response = await axiosInstance.get(`/report/cashflow_header_overview/get/${date}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch cashflow header overview", error);
        throw error;
    }
};

export const getIslandWiseIncomeCashflow = async (date) => {
    try {
        const response = await axiosInstance.get(`/report/island_wise_income/get/${date}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch island wise income cashflow", error);
        throw error;
    }
};


export const getProductWiseIncomeCashflow = async (date) => {
    try {
        const response = await axiosInstance.get(`/report/product_wise_income/get/${date}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch product wise income cashflow", error);
        throw error;
    }
};


export const getCategoryWiseExpenseCashflow = async (date) => {
    try {
        const response = await axiosInstance.get(`/report/category_wise_expense/get/${date}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch category wise expense cashflow", error);
        throw error;
    }
};

