import axios from "axios";
import { useAuthStore } from "../../store/useAuthStore";
import { axios401RefreshInterceptor } from "./axiosRefreshOn401.js";

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

// Registration API call
export const register = async (username, organisation, email, password) => {
  try {
    const response = await axiosInstance.post("/register", {
      username,
      organisation,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Error during registration:", error);
    throw error;
  }
};

// OTP Confirmation API call
export const otpConfirmation = async (email, organisation, otp) => {
  try {
    const response = await axiosInstance.post("/otp_verification", null, {
      timeout: 100000,
      params: { email, otp, organisation },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to confirm OTP");
  }
};

// Login API call
export const login = async (email, password) => {
  try {
    const response = await axiosInstance.post("/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    if (error.response && error.response.data) {
      // Provide more context on the error
      throw new Error(
        `Login failed: ${error.response.data.message || "Unknown error"}`
      );
    }
    throw new Error("Failed to login");
  }
};

//forgot password api call.
export const forgotPassword = async (email) => {
  try {
    const response = await axiosInstance.post(
      `/forget_password?email=${email}`,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Forgot password request failed:", error);
    if (error.response && error.response.data) {
      throw new Error(
        `Forgot password failed: ${
          error.response.data.message || "Unknown error"
        }`
      );
    }
    throw new Error("Failed to send forgot password request");
  }
};

//confiem otppai call.
export const confirmOtpOnPasswordReset = async (email, otp) => {
  try {
    const response = await axiosInstance.post(
      `/otp_confirmation?email=${email}&otp=${otp}`,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Forgot password otp validation failed:", error);
    if (error.response && error.response.data) {
      throw new Error(
        `Forgot password failed: ${
          error.response.data.message || "Unknown error"
        }`
      );
    }
    throw new Error("Failed to send forgot password request");
  }
};

//change passwor api call.
export const updateAuthPassword = async (password, token) => {
  try {
    const response = await axiosInstance.post(
      `/change_password?new_password=${password}`, // First argument: URL
      {}, // Second argument: Request body (empty in this case)
      {
        headers: {
          // Third argument: Headers
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Reset password validation failed:", error);
    if (error.response && error.response.data) {
      throw new Error(
        `Reset password failed: ${
          error.response.data.message || "Unknown error"
        }`
      );
    }
    throw new Error("Failed to send forgot password request");
  }
};

// Employee APIs
export const getEmployeesApi = async () => {
  try {
    const response = await axiosInstance.get("/employees/get_all");
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch employees");
  }
};

export const getEmployeeApi = async (id) => {
  try {
    const response = await axiosInstance.get(`/employees/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch employee");
  }
};

export const createEmployeeApi = async (employeeData) => {
  try {
    // Transform the data to match the API expectations
    const transformedData = {
      name: employeeData.name,
      role: employeeData.role,
      contact_number: employeeData.contact_number,
      employee_id: employeeData.employee_id,
      email: employeeData.email,
      salary: employeeData.salary || employeeData.base_salary
    };
    const response = await axiosInstance.post("/employees/create", transformedData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to create employee");
  }
};

export const updateEmployeeApi = async (employeeData) => {
  try {
    // Transform the data to match the API expectations
    const transformedData = {
      id: parseInt(employeeData.id),
      name: employeeData.name,
      role: employeeData.role,
      contact_number: parseInt(employeeData.contact_number.toString().replace(/\D/g, '')), // Convert to integer and remove non-digits
      employee_id: employeeData.employee_id,
      email: employeeData.email,
      salary: parseFloat(employeeData.salary) // Convert to float
    };

    
    const response = await axiosInstance.put("/employees/update", transformedData);
    return response.data;
  } catch (error) {
    console.error('Error updating employee:', error.response?.data || error);
    throw new Error(error.response?.data?.detail || "Failed to update employee");
  }
};

export const deleteEmployeeApi = async (id) => {
  try {
    const response = await axiosInstance.delete(`/employees/delete/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.detail || "Failed to delete employee");
  }
};

export const getInventory = async (date) => {
  try {
    const token = getToken();
    const response = await axiosInstance.get("/product/get", {
      params: {
        date: date,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch inventory");
  }
};

export const addInventoryProduct = async (productDetails) => {
  try {
    const response = await axiosInstance.post(
      "/product/add_product",
      productDetails
    );
    return response.data;
  } catch (error) {
    console.error("Failed to add product inventory:", error);
    throw new Error("Failed to add product inventory");
  }
};
export const updateInventoryPrice = async (productData) => {
  try {
    const response = await axiosInstance.post(
      `/product/update_price`,
      {
        id: productData.id,
        name: productData.name,
        price: productData.price,
        date: productData.date
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to update inventory price:", error);
    throw new Error("Failed to update inventory price");
  }
};

export const deleteInventoryProduct = async (productId, date) => {
  try {
    const response = await axiosInstance.delete(
      `/product/delete_product/${productId}`,
      {
        params: {
          date: date
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to delete product:", error);
    throw new Error("Failed to delete product");
  }
};

export const getLinkedPortfolio = async (id) => {
  try {
    const response = await axiosInstance.get(
      `/product/get_linked_portfolio/${id}`
    );
    return response.data;
  } catch (err) {
    throw new Error("Failed to get linked portfolio  ");
  }
};

export const updateProductStatus = async (id, isDiscontinued) => {
  try {
    const response = await axiosInstance.post("/product/update_product", {
      id,
      discontinued: isDiscontinued,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating product status:", error);
    throw error;
  }
};

export const getPortfolio = async (date) => {
  try {
    const token = getToken(); // Retrieve the JWT token
    const response = await axiosInstance.get(
      "/portfolio/get", // URL path
      {
        params: {
          date: date,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch portfolio:", error);
    throw new Error("Failed to fetch portfolio");
  }
};
export const addPortfolioAPi = async (portfolio_name) => {
  try {
    const token = getToken();
    const response = await axiosInstance.post(
      "/portfolio/add",
      portfolio_name,
      {
        headers: {
          Accept: "application/json", // Ensure correct content type header
        },
        params: {
          portfolio_name: portfolio_name,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to add portfolio:", error);
    throw new Error("Failed to add portfolio");
  }
};

export const updatePortfolioApi = async (portfolio_id, portfolio_name) => {
  try {
    const token = getToken();
    const response = await axiosInstance.post(
      "/portfolio/update",
      null,
      {
        headers: {
          Accept: "application/json",
        },
        params: {
          id: portfolio_id,
          portfolio_name: portfolio_name,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to update portfolio:", error);
    throw new Error("Failed to update portfolio");
  }
};

export const deletePortfolioAPi = async (id) => {
  try {
    const token = getToken();
    const response = await axiosInstance.delete("/portfolio/delete", {
      params: {
        id: id,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to delete portfolio:", error);
    throw new Error("Failed to delete portfolio");
  }
};

export const getSales_unit = async (portfolio_id, shift_id, date) => {
  try {
    const response = await axiosInstance.get(
      "/meter_reading/get",
      {
        params: {
          portfolio_id: portfolio_id,
          shift_id: shift_id,
          date: date,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch sales unit:", error);
    throw new Error("Failed to fetch sales unit");
  }
};

export const add_MeterReading = async (newMeterReading) => {
  try {
    const response = await axiosInstance.post(
      "/meter_reading/add",
      newMeterReading
    );
    return response;
  } catch (error) {
    console.error("Failed to add meter reading:", error);
    throw new Error("Failed to add meter reading");
  }
};

export const updateMeterReading = async (newSalesUnit) => {
  try {
    const response = await axiosInstance.post(
      "/meter_reading/update_meter_reading",
      newSalesUnit
    );
    return response.data;
  } catch (error) {
    console.error("Failed to add sales unit:", error);
    throw new Error("Failed to add sales unit");
  }
};

export const updateSalseUnitStatus = async (sales_unit_name, status) => {
  try {
    const token = getToken(); // Retrieve the JWT token

    const response = await axiosInstance.post(`/meter_reading/change_status`, {
      sales_unit_name: sales_unit_name,
      status: status,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to delete sales unit:", error);
    throw new Error("Failed to delete sales unit");
  }
};

export const getMeterReadings = async () => {
  try {
    const response = await axiosInstance.get("/meter_reading/get_all");
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch meter readings");
  }
};

export const getTallySummary = async (portfolio_id, date, shiftId) => {
  try {
    const response = await axiosInstance.post("/tally/get", {
      portfolio_id: portfolio_id,
      date: date,
      shift_id: shiftId,
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch tally summary");
  }
};

export const getCashflow = async (shift_id, portfolio_id, date) => {
  try {
    const response = await axiosInstance.get(`/cashflow/${portfolio_id}/get`, {
      params: {
        shift_id: shift_id,
        date: date,
        portfolio_id: portfolio_id,
      },
    });
    return response.data.data;
  } catch (error) {
    throw new Error("Failed to fetch cashflow");
  }
};

export const addcashflow = async (cashflow) => {
  try {
    const response = await axiosInstance.post("/cashflow/upsert", { cashflow });
    return response.data;
  } catch (error) {
    throw new Error("Failed to add cashflow");
  }
};

export const deleteCashflow = async (id) => {
  try {
    const response = await axiosInstance.delete(`/cashflow/delete?id=${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to delete the cashflow");
  }
};

export const DeleteAllCashflow = async (date, portfolioId, shiftId) => {
  try {
    const token = getToken();
    const params = { date };
    if (portfolioId != null && portfolioId !== "") params.portfolio_id = portfolioId;
    if (shiftId != null && shiftId !== "") params.shift_id = shiftId;
    const response = await axiosInstance.delete("/cashflow/delete_all", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to delete all cashflow");
  }
};

/** Remove all meter rows for the current island shift + date (mock / demo). */
export const deleteAllMeterReadingsForShift = async (date, portfolioId, shiftId) => {
  try {
    const response = await axiosInstance.delete("/meter_reading/delete_all", {
      params: {
        date,
        portfolio_id: portfolioId,
        shift_id: shiftId,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to delete all sales units");
  }
};

export const getTallySummaryByDate = async (date) => {
  try {
    const token = getToken();
    const response = await axiosInstance.post(
      "/tally/get_tally_summary",
      {
        date: date,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json", // Ensure correct content type header
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch tally");
  }
};

export const getCustomer = async () => {
  try {
    const token = getToken();
    const response = await axiosInstance.get("/customer/get", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch customer");
  }
};

export const addCustomer = async (customer) => {
  try {
    const token = getToken();
    const response = await axiosInstance.post("/customer/add", customer, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to add customer");
  }
};

export const get_customer_vehicles = async (customer_id) => {
  try {
    const token = getToken();
    const response = await axiosInstance.get("/customer/vehicle_details", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      params: {
        customer_id: customer_id,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch customer vehicles");
  }
};

export const getall_vehicle_details = async () => {
  try {
    const token = getToken();
    const response = await axiosInstance.get(`/customer/vehicle_details/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch customer vehicles");
  }
};

export const add_customer_vehicles = async (vehicle) => {
  try {
    const token = getToken();
    const response = await axiosInstance.post(
      "/customer/vehicle_details/upsert",
      {
        ...vehicle,
        customer_id: vehicle.customer_id,
        vehicle_number: vehicle.vehicle_number || vehicle.vehicle_no,
        type: vehicle.type,
        id: vehicle.id
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to add customer vehicles");
  }
};

export const delete_customer_vehicles = async (id) => {
  try {
    const response = await axiosInstance.delete(
      "/customer/vehicle_details/delete",
      {
        params: {
          id: id,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to delete customer vehicles");
  }
};

export const add_customer_credit = async (credit) => {
  try {
    const token = getToken();
    const response = await axiosInstance.post("/credit/upsert_credit", credit, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 422) {
      throw new Error("Validation error: " + error.response.data.message);
    } else {
      throw new Error("Failed to add customer credit");
    }
  }
};

export const delete_customer_credit = async (id) => {
  try {
    const token = getToken();
    const response = await axiosInstance.delete("/credit/delete_credit", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      params: {
        id: id,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to delete customer credit");
  }
};

export const get_filter_credit = async (page, searchObject) => {
  try {
    const token = getToken();
    const filters = JSON.stringify(searchObject);
    const response = await axiosInstance.get("/credit/get", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      params: {
        page: page,
        filters: filters,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch customer credit");
  }
};

export const insert_credit = async (credit) => {
  try {
    const response = await axiosInstance.post("/credit/insert_credit", credit);
    return response.data;
  } catch (error) {
    throw new Error("Failed to insert credit");
  }
};

export const get_global_expense = async () => {
  try {
    const response = await axiosInstance.get("/cashflow/global_expense");
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch global cashflow");
  }
};

export const get_all_cashflow = async () => {
  try {
    const response = await axiosInstance.get("/cashflow/get_all_cashflow");
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch all cashflow");
  }
};

//

export const addBankAccount = async (bankName) => {
  try {
    const response = await axiosInstance.post(`/bank_account/add`, {
      bank_name: bankName,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding bank account:", error);
    throw error;
  }
};

// Get Bank Account Details
export const getBankAccountDetails = async () => {
  try {
    const response = await axiosInstance.get(`/bank_account/get`);
    return response.data;
  } catch (error) {
    console.error("Error fetching bank account details:", error);
    throw error;
  }
};

export const deleteBankAccount = async (accountId) => {
  try {
    const response = await axiosInstance.post("/bank_account/delete", {
      id: accountId,
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting accountId:", error);
    throw error;
  }
};

// Add a Mode
export const addMode = async (associatedAccountId, modeName) => {
  try {
    const response = await axiosInstance.post(`/mode/add`, {
      mode_name: modeName,
      associated_account: associatedAccountId,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding mode:", error);
    throw error;
  }
};

// Get Modes
export const getModes = async () => {
  try {
    const response = await axiosInstance.get(`/mode/get`);
    return response.data;
  } catch (error) {
    console.error("Error fetching modes:", error);
    throw error;
  }
};

export const deleteModes = async (modeId) => {
  try {
    const response = await axiosInstance.post("/mode/delete", {
      id: modeId,
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting mode:", error);
    throw error;
  }
};

export const getModeList = async () => {
  try {
    const response = await axiosInstance.get(`/mode/list`);
    return response.data;
  } catch (error) {
    console.error("Error fetching payment modes:", error);
    throw error;
  }
};

export const getShiftConfig = async (date) => {
  try {
    const response = await axiosInstance.get(`/portfolio/get_shifts`, {
      params: { date: date },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching shift config:", error);
    throw error;
  }
};

export const addShiftConfig = async (shiftConfig) => {
  try {
    const response = await axiosInstance.post(
      `/portfolio/add_shift`,
      {
        ...shiftConfig,
        portfolio_id: shiftConfig.portfolio_id
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error adding shift config:", error);
    throw error;
  }
};

export const disableShiftConfig = async (disablePayload) => {
  if (!disablePayload || !disablePayload.portfolio_id || !disablePayload.shift_name || !disablePayload.end_date) {
    throw new Error('Invalid payload: portfolio_id, shift_name, and end_date are required');
  }

  try {
    const response = await axiosInstance.post(
      `/portfolio/disable_shift`,
      {
        portfolio_id: disablePayload.portfolio_id,
        shift_name: disablePayload.shift_name,
        end_date: disablePayload.end_date
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error disabling shift config:", error);
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error('Failed to disable shift configuration');
  }
};
export const bulkUpsertMeterReadings = async (readings) => {
  try {
    const response = await axiosInstance.post(
      "/meter_reading/bulk_upsert",
      readings
    );
    return response;
  } catch (error) {
    console.error("Error bulk upserting meter readings:", error);
    throw error;
  }
};

export const deleteSalesUnit = async (id) => {
  try {
    const response = await axiosInstance.post(`/meter_reading/delete?id=${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to delete meter reading");
  }
};

export const getPortfolioListForCredit = async (date) => {
  try {
    const response = await axiosInstance.get(`/portfolio/list`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch portfolio list for credit");
  }
};

export const getOrganisationName = async () => {
  try {
    const response = await axiosInstance.get(`/Organisation`);
    return response.data;
  } catch (error) {
    throw new Error("Failed to fetch organisation name");
  }
};

export const getUserDetails = async () => {
  try {
    const response = await axiosInstance.get(`/user`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw new Error();
    }
    throw new Error("Failed to get user details");
  }
};

export const insert_credit_details = async (credit) => {
  try {
    const response = await axiosInstance.post("/credit/insert_credit", credit);
    return response.data;
  } catch (error) {
    throw new Error("Failed to insert credit details");
  }
};

export const EditShiftDetails = async (shiftDetails) => {
  try {
    const response = await axiosInstance.post(
      "/portfolio/edit_shift",
      {
        ...shiftDetails,
        portfolio_id: shiftDetails.portfolio_id
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to update shift details");
  }
};

export const getIslandShiftSpecificCashflowSummary = async (date,shift_id, portfolio_id) => {
  try {
    const response = await axiosInstance.get(
      `/report/island_shift_specific_cashflow_summary/get/`,
      {
        params: {
          date: date,
          shift_id: shift_id,
          portfolio_id: portfolio_id,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching shift config:", error);
    throw error;
  }
};

export const bulkUpsertCashflow = async (cashflowData) => {
  try {
    const response = await axiosInstance.post("/cashflow/upsert", cashflowData);
    return response.data;
  } catch (error) {
    console.error("Failed to upsert cashflow:", error);
    throw new Error("Failed to upsert cashflow");
  }
};

export const updateCustomer = async (customer) => {
  try {
    const response = await axiosInstance.put(`/customer/update?customer_id=${customer.id}`, {
      name: customer.name,
      email: customer.email,
      contact_phone: customer.contact_phone,
      credit_limit: customer.credit_limit
    });
    return response.data;
  } catch (error) {
    console.error("Error updating customer:", error);
    throw error;
  }
};

export const deleteCustomer = async (customerId) => {
  try {
    const response = await axiosInstance.delete(`/customer/delete?customer_id=${customerId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting customer:", error);
    throw error;
  }
};

export const toggleCustomerStatus = async (customerId) => {
  try {
    const response = await axiosInstance.put(`/customer/toggle_status?customer_id=${customerId}`);
    return response.data;
  } catch (error) {
    console.error("Error toggling customer status:", error);
    throw error;
  }
};

export const changeMeterReadingStatus = async (meterReadingId) => {
  try {
    const response = await axiosInstance.post("/meter_reading/change_status", {
      id: meterReadingId
    });
    return response.data;
  } catch (error) {
    throw new Error("Failed to change meter reading status");
  }
};

export const toggleShiftStatus = async (islandId, shiftId, currentActive) => {
  try {
    const response = await axiosInstance.put(
      `/portfolio/disable_enable_shift`,
      {
        portfolio_id: islandId,
        shift_id: shiftId,
        status: !currentActive,
        end_date: currentActive ? new Date().toISOString().split('T')[0] : '9999-12-31'
      }
    );
    // Get the updated shift data
    const updatedShift = await getShiftConfig(new Date().toISOString().split('T')[0]);
    return { message: response.data.message, updatedData: updatedShift };
  } catch (error) {
    console.error("Error toggling shift status:", error);
    throw error;
  }
};

export const deleteShift = async (shiftId) => {
  try {
    const response = await axiosInstance.delete(
      `/portfolio/delete_shift/${shiftId}`
    );
    // Get the updated shift data
    const updatedShift = await getShiftConfig(new Date().toISOString().split('T')[0]);
    return { message: response.data.message, updatedData: updatedShift };
  } catch (error) {
    console.error("Error deleting shift:", error);
    throw error;
  }
};

export const getPortfolioShifts = async (portfolioId, date) => {
  try {
    const response = await axiosInstance.get(`/portfolio/list_shifts/${portfolioId}/${date}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching portfolio shifts:", error);
    throw error;
  }
};
