import { create } from "zustand";
import {
  add_customer_credit,
  add_customer_vehicles,
  delete_customer_credit,

  delete_customer_vehicles,
  get_customer_vehicles,
  getall_vehicle_details,
  get_filter_credit,

  insert_credit,

} from "../src/services/apiService";
import { generateBill, addPayment, getTransactionDetails, deleteTransaction, getCustomerDetails } from "../src/pages/Customer/api/CustomerService";

export const useCreditCustomerStore = create((set, get) => ({
  creditCustomers: [],
  transactions: [],
  vehicleDetails: [],
  allVehicleDetails: {},
  customerDetails: {},
  loading_credit: false,
  loading: false,
  loadingDelete: false,
  loadingAdd: false,
  total_count_credit: 0,
  total_count_transactions: 0,
  total_count_vehicle: 0,
  error: null,
  lastVehicleFetch: null, // Track when vehicles were last fetched
  
  setCreditCustomers: (creditCustomers) => set({ creditCustomers }),
  setTransactions: (transactions) => set({ transactions }),
  setVehicleDetails: (vehicleDetails) => set({ vehicleDetails }),
  setAllVehicleDetails: (allVehicleDetails) => set({ allVehicleDetails }),
  setCustomerDetails: (customerDetails) => set({ customerDetails }),
  setError: (error) => set({ error }),

  fetchCustomerDetails: async (customerId) => {
    set({ loading: true, error: null });
    try {
      const response = await getCustomerDetails(customerId);
      const cid = Number(customerId);
      let formattedCustomerDetails = null;

      if (response && typeof response === "object") {
        if (Array.isArray(response)) {
          formattedCustomerDetails =
            response.find((c) => Number(c?.id) === cid) ?? response[0] ?? null;
        } else if (response.id != null && Number(response.id) === cid) {
          /** Single customer object from `/customer/customer_details` (same shape as list row). */
          formattedCustomerDetails = response;
        } else {
          const values = Object.values(response);
          formattedCustomerDetails = values.find(
            (c) => c && typeof c === "object" && Number(c.id) === cid
          );
          if (!formattedCustomerDetails) {
            formattedCustomerDetails = values.find(
              (c) => c && typeof c === "object" && (c.customer_name != null || c.name != null)
            );
          }
        }
      }

      set({ customerDetails: formattedCustomerDetails });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error fetching customer details";
      set({ error: errorMessage });
    } finally {
      set({ loading: false });
    }
  },

  fetchCreditCustomers: async (page, customerName) => {
    const searchObject = [{
      searchTerm: customerName,
      filterOption: "customer_name",
    }];
    set({ loading_credit: true, error: null });
    try {
      const data = await get_filter_credit(page, searchObject);
      set({
        creditCustomers: Object.values(data.data),
        total_count_credit: data.total_count,
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error fetching credit customers";
      set({ error: errorMessage });
    } finally {
      set({ loading_credit: false });
    }
  },
  
  upsertCreditCustomer: async (creditCustomer) => {
    set({ loadingAdd: true, error: null });
    const formatDate = (inputDate) => {
      const date = new Date(inputDate);
      const year = date.getFullYear();
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${year}-${day}-${month}`;
    };

    const transformDataToOriginal = (data) => {
      return {
        customer_name: data.customer_name,
        date: formatDate(data.date),
        id: data.id,
        portfolio_name: data.portfolio_name,
        amount: data.products.map((product) => product.amount),
        price: data.products.map((product) => product.price),
        product_name: data.products.map((product) => product.product_name),
        quantity: data.products.map((product) => product.quantity),
        uom: data.products.map((product) => product.uom),
        total_amount: data.products.reduce(
          (total, product) => total + product.amount,
          0
        ),
        vehicle_no: data.vehicle,
      };
    };
    const creditCustomer_new = transformDataToOriginal(creditCustomer);

    try {
      const response = await add_customer_credit(creditCustomer);
      set((state) => {
        const existingIndex = state.creditCustomers.findIndex(
          (credit) => credit.id === creditCustomer.id
        );
        if (existingIndex !== -1) {
          const updatedCreditCustomers = [...state.creditCustomers];
          updatedCreditCustomers[existingIndex] = creditCustomer_new;
          return { creditCustomers: updatedCreditCustomers };
        }
        return {
          creditCustomers: [...state.creditCustomers, creditCustomer_new],
        };
      });
      return Promise.resolve();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to add/update credit customer";
      set({ error: errorMessage });
      return Promise.reject(error);
    } finally {
      set({ loadingAdd: false });
    }
  },

  insertCreditCustomer: async (creditCustomer) => {
    set({ loadingAdd: true, error: null });
    const formatDate = (inputDate) => {
      const date = new Date(inputDate);
      const year = date.getFullYear();
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${year}-${day}-${month}`;
    };

    const transformDataToOriginal = (data) => {
      return {
        customer_name: data.customer_name,
        date: formatDate(data.date),
        id: data.id,
        portfolio_name: data.portfolio_name,
        amount: data.products.map((product) => product.amount),
        price: data.products.map((product) => product.price),
        product_name: data.products.map((product) => product.product_name),
        quantity: data.products.map((product) => product.quantity),
        uom: data.products.map((product) => product.uom),
        total_amount: data.products.reduce(
          (total, product) => total + product.amount,
          0
        ),
        vehicle_no: data.vehicle,
      };
    };
    const creditCustomer_new = transformDataToOriginal(creditCustomer);
    try {
      const response = await insert_credit(creditCustomer);
      return Promise.resolve();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to insert credit customer";
      set({ error: errorMessage });
      return Promise.reject(error);
    } finally {
      set({ loadingAdd: false });
    }
  },

  deleteCreditCustomer: async (id) => {
    set({ loadingDelete: true, error: null });
    try {
      const response = await delete_customer_credit(id);
      set((state) => ({
        creditCustomers: state.creditCustomers.filter(
          (credit) => credit.id !== id
        ),
      }));
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error deleting credit customer";
      set({ error: errorMessage });
      return Promise.reject(error);
    } finally {
      set({ loadingDelete: false });
    }
  },
  
  // Optimized: Fetch all vehicle details once
  fetchAllVehicleDetails: async () => {
    set({ loading: true, error: null });
    try {
      const response = await getall_vehicle_details();
      set({
        allVehicleDetails: response.data,
        lastVehicleFetch: new Date(),
        loading: false,
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.message || "Failed to fetch all vehicle details";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  // Helper function to get vehicles for a specific customer
  getVehiclesForCustomer: (customerId) => {
    const { allVehicleDetails } = get();
    const customerVehicles = allVehicleDetails[customerId];
    
    if (!customerVehicles) {
      return [];
    }
    
    // Convert the vehicle_no array to the expected format
    return customerVehicles.vehicle_no.map((vehicleNo, index) => ({
      id: `${customerId}_${index}`, // Generate a unique ID
      vehicle_no: vehicleNo,
      customer_id: customerId,
    }));
  },

  // Check if data needs to be refreshed (5 minutes cache)
  shouldRefreshVehicles: () => {
    const { lastVehicleFetch } = get();
    if (!lastVehicleFetch) return true;
    
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastVehicleFetch < fiveMinutesAgo;
  },

  // Legacy function - kept for backward compatibility
  fetchVehicleDetails: async (customer_id) => {
    set({ loading: true, error: null });
    try {
      const data = await get_customer_vehicles(customer_id);
      set({
        vehicleDetails: Object.values(data.data),
        total_count_vehicle: data.total_count,
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error fetching vehicle details";
      set({ error: errorMessage });
    } finally {
      set({ loading: false });
    }
  },

  addVehicleDetails: async (vehicleDetailsdata) => {
    set({ loadingAdd: true, error: null });
    try {
      const response = await add_customer_vehicles(vehicleDetailsdata);
      
      // Update legacy vehicleDetails for backward compatibility
      set((state) => {
        const existingIndex = state.vehicleDetails.findIndex(
          (vehicle) => vehicle.id === vehicleDetailsdata.id
        );
        if (existingIndex !== -1) {
          const updatedVehicleDetails = [...state.vehicleDetails];
          updatedVehicleDetails[existingIndex] = vehicleDetailsdata;
          return { vehicleDetails: updatedVehicleDetails };
        }
        return {
          vehicleDetails: [...state.vehicleDetails, vehicleDetailsdata],
        };
      });
      
      // Refresh the optimized cache to include the new vehicle
      const { fetchAllVehicleDetails } = get();
      await fetchAllVehicleDetails();
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to add/update vehicle details";
      set({ error: errorMessage });
    } finally {
      set({ loadingAdd: false });
    }
  },

  deleteVehicleDetails: async (id) => {
    set({ loadingDelete: true, error: null });
    try {
      const response = await delete_customer_vehicles(id);
      set((state) => ({
        vehicleDetails: state.vehicleDetails.filter(
          (vehicle) => vehicle.id !== id
        ),
      }));
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error deleting vehicle details";
      set({ error: errorMessage });
    } finally {
      set({ loadingDelete: false });
    }
  },

  // Transactions related functions
  fetchTransactions: async (customerId) => {
    set({ loading: true, error: null });
    try {
      const response = await getTransactionDetails(customerId);
      const transactions = response.data || [];
      set({
        transactions,
        total_count_transactions: transactions.length
      });
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to fetch transactions";
      set({ error: errorMessage });
    } finally {
      set({ loading: false });
    }
  },

  generateBill: async (billData) => {
    set({ loadingAdd: true, error: null });
    try {
      const response = await generateBill(billData);
      await getTransactionDetails(billData.customer_id).then((data) => {
        set({ transactions: data.data || [] });
      });
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to generate bill";
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ loadingAdd: false });
    }
  },

  addPayment: async (paymentData) => {
    set({ loadingAdd: true, error: null });
    try {
      const response = await addPayment(paymentData);
      await getTransactionDetails(paymentData.customer_id).then((data) => {
        set({ transactions: data.data || [] });
      });
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to add payment";
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ loadingAdd: false });
    }
  },

  deleteTransaction: async (transactionId) => {
    set({ loadingDelete: true, error: null });
    try {
      const response = await deleteTransaction(transactionId);
      set((state) => ({
        transactions: state.transactions.filter(t => t.id !== transactionId)
      }));
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to delete transaction";
      set({ error: errorMessage });
      throw error;
    } finally {
      set({ loadingDelete: false });
    }
  },
}));
