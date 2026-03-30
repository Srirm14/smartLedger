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

export const CustomerBillingDetails = async (startDate, endDate, customerId, customerName, date, billId = null) => {
  try {
    // Validate dates
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }
    
    
    const response = await axiosInstance.post("/credit/download_credit_report_csv", {
      customer_id: customerId,
      start_date: startDate,
      end_date: endDate,
      interest: 0,
      bill_id: billId,
      date: date || new Date().toISOString().split('T')[0] // Add current date if not provided
    }, {
      responseType: 'blob'
    });
    
    // Create a blob from the response
    const blob = new Blob([response.data], { 
      type: 'text/csv'
    });
    
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `credit_report_${customerName}_${startDate}_${endDate}.csv`);
    
    // Append to body, click and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL
    window.URL.revokeObjectURL(url);
    
    return response;
  } catch (error) {
    console.error('Error downloading report:', error);
    throw error;
  }
};

export const sendCreditReportEmail = async (startDate, endDate, customerId, customerName, date) => {
  try {
    // Validate dates
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }
    
    // Ensure dates are in YYYY-MM-DD format
    const formattedStartDate = startDate;
    const formattedEndDate = endDate;
  
    
    const response = await axiosInstance.post("/credit/send_credit_report_email", null, {
      params: {
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        customer_id: customerId,
        customer_name: customerName,
        date: date
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error sending credit report email:', error);
    throw error;
  }
};


export const generateBill = async (bill) => {
  try {
    const response = await axiosInstance.post("/customer/generate_bill", bill);
    return response.data;
  } catch (error) {
    console.error('Error generating bill:', error);
    throw error;
  }
};

export const addPayment = async (payment) => {
  try {
    const response = await axiosInstance.post("/customer/transaction_payment_upsert", payment);
    return response.data;
  } catch (error) {
    console.error('Error adding payment:', error);
    throw error;
  }
};


export const getTransactionDetails = async (customerId) => {
  try {
    const response = await axiosInstance.get(`/customer/transaction?customer_id=${customerId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting transaction details:', error);
    throw error;
  }
};

export const deleteTransaction = async (transactionId) => {
  try {
    const response = await axiosInstance.delete(`/customer/transaction_delete?id=${transactionId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

export const getCustomerReportPreview = async (startDate, endDate, customerId, billId = null) => {
  try {
    // Validate dates
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }
    
    const response = await axiosInstance.get("/credit/preview_credit_report", {
      params: {
        start_date: startDate,
        end_date: endDate,
        customer_id: customerId,
        bill_id: billId
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting report preview:', error);
    throw error;
  }
};

export const generateCreditReport = async (billData) => {
  try {
    // Validate dates
    if (!billData.start_date || !billData.end_date) {
      throw new Error('Start date and end date are required');
    }
    
    const response = await axiosInstance.post("/credit/generate_credit_report/", {
      customer_id: billData.customer_id,
      start_date: billData.start_date,
      end_date: billData.end_date,
      interest: billData.interest || 0,
      bill_id: billData.bill_id,
      date: new Date().toISOString().split('T')[0] // Add current date
    });
    return response.data;
  } catch (error) {
    console.error('Error generating credit report:', error);
    throw error;
  }
};

export const getCustomerDetails = async (customerId) => {
  try {
    const response = await axiosInstance.get(`/customer/customer_details?customer_id=${customerId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting customer details:', error);
    throw error;
  }
};












