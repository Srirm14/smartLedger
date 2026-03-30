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

// Get all inventory items
export const getAllInventory = async () => {
  try {
    const response = await axiosInstance.get("/stock_management/get");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add new inventory item
export const addInventory = async (inventoryData) => {
  try {
    const response = await axiosInstance.post("/stock_management/add_stock", inventoryData);
    return response.data;
  } catch (error) {
    throw error;
  }
};


// Update Stock Details 
export const updateStockDetails = async (data) => {
  try {
    const response = await axiosInstance.post("/stock_management/update", data);
    return response.data;
  } catch (error) {
    throw error;
  }
}
// Update inventory alert settings
export const updateInventoryAlert = async (id, enabled, lowStockLimit) => {
  try {
    const response = await axiosInstance.post("/stock_management/update_alert", {
      id,
      status: enabled,
      low_stock_limit: lowStockLimit
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get detailed inventory item information
export const getStockDetails = async (id) => {
  try {
    const response = await axiosInstance.get(`/stock_management/get_stock_details?id=${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get inventory header information
export const getStockDetailsHeader = async (id,date) => {
  try {
    const response = await axiosInstance.get(`/stock_management/get_stock_management_header?id=${id}&date=${date}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get inventory transaction history
export const getStockTransactionHistory = async (id) => {
  try {
    const response = await axiosInstance.get(`/stock_management/get_stock_transaction_history?id=${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get inventory meter reading history
export const getStockMeterReadingHistory = async (id) => {
  try {
    const response = await axiosInstance.get(`/stock_management/get_meter_reading_history?id=${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get inventory sales unit link information
export const getStockSalesUnitLink = async (id, date) => {
  try {
    const response = await axiosInstance.get(`/stock_management/get_stock_sales_unit_link?id=${id}&date=${date}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ADD SalesUnit Link TO Stock
 
export const linkSalesUnitToStock = async (data) => {
  try {
    const response = await axiosInstance.post("/stock_management/link_sales_unit", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Unlink SalesUnit From Stock

export const unlinkSalesUnitFromStock = async (data) => {
  try {
    const response = await axiosInstance.post("/stock_management/unlink_sales_unit", data);
    return response.data;
  } catch (error) {
    throw error;
  }
};


// ADD Stock Transactions

export const addStockTransactions = async (data) => {
  try {
    const response = await axiosInstance.post("/stock_management/add_stock_transaction", data);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Update Stock Transactions 


export const updateStockTransactions = async (data) => {
  try {
    const response = await axiosInstance.post("/stock_management/update_stock_transaction", data);
    return response.data;
  } catch (error) {
    throw error;
  }
}


// Delete Stock Transactions

export const deleteStockTransactions = async (data) => {
  try {
    const response = await axiosInstance.delete(`/stock_management/delete_stock_transaction?id=${data.id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Delete Stock Item
export const deleteStock = async (stockId) => {
  try {
    const response = await axiosInstance.delete(`/stock_management/delete_stock/${stockId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}
// Get SalesUnit Product
export const getSalesUnitProduct = async (productId) => {
  try {
    const response = await axiosInstance.get(`/meter_reading/sales_unit?product_id=${productId}`);
    
    if (response.data && Array.isArray(response.data)) {
      const mappedData = response.data.map(unit => ({
        id: unit.id,
        name: unit.name || unit.sales_unit_name
      }));
      return mappedData;
    }
    return [];
  } catch (error) {
    return [];
  }
};



