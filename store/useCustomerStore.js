import { create } from "zustand";
import { addCustomer, getCustomer, updateCustomer, deleteCustomer, toggleCustomerStatus } from "../src/services/apiService";
import toast from "react-hot-toast";

export const useCustomerStore = create((set) => ({
  customers: [],
  
  loading: false,
  setCustomers: (customers) => set({ customers }),
  setLoading: (loading) => set({ loading }),

  fetchCustomers: async () => {
    set({ loading: true });
    try {
      const data = await getCustomer(); 
      set({ customers: Object.values(data) });
    } catch (error) {
      console.error("Error fetching customers", error);
      const errorMessage = error?.response?.data?.detail || "Failed to fetch customers";
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },
  
  addCustomer: async (customer) => {
    set({ loading: true });
    try {
      await addCustomer(customer);
      const formattedCustomer = {
        customer_name: customer.name,
        email: customer.email,
        contact_phone: customer.contact_phone,
        credit_limit: customer.credit_limit,
        is_active: true
      };
      set((state) => ({
        customers: [...state.customers, formattedCustomer],
        loading: false
      }));
      toast.success("Customer added successfully");
    } catch (error) {
      console.error("Failed to add customer", error?.response?.data?.detail);
      const errorMessage = error?.response?.data?.detail || "Failed to add customer";
      toast.error(errorMessage);
      set({ loading: false });
    }
  },

  updateCustomer: async (customer) => {
    set({ loading: true });
    try {
      await updateCustomer(customer);
      set((state) => ({
        customers: state.customers.map((c) =>
          c.id === customer.id ? { 
            ...c, 
            customer_name: customer.name, 
            email: customer.email,
            contact_phone: customer.contact_phone,
            credit_limit: customer.credit_limit
          } : c
        ),
        loading: false
      }));
      toast.success("Customer updated successfully");
    } catch (error) {
      console.error("Failed to update customer", error?.response?.data?.detail);
      const errorMessage = error?.response?.data?.detail || "Failed to update customer";
      toast.error(errorMessage);
      set({ loading: false });
    }
  },

  deleteCustomer: async (customerId) => {
    set({ loading: true });
    try {
      await deleteCustomer(customerId);
      set((state) => ({
        customers: state.customers.filter((c) => c.id !== customerId),
        loading: false
      }));
      toast.success("Customer deleted successfully");
    } catch (error) {
      console.error("Failed to delete customer", error?.response?.data?.detail);
      const errorMessage = error?.response?.data?.detail || "Failed to delete customer";
      toast.error(errorMessage);
      set({ loading: false });
    }
  },

  toggleCustomerStatus: async (customerId) => {
    set({ loading: true });
    try {
      await toggleCustomerStatus(customerId);
      set((state) => ({
        customers: state.customers.map((c) =>
          c.id === customerId ? { ...c, is_active: !c.is_active } : c
        ),
        loading: false
      }));
    } catch (error) {
      console.error("Failed to toggle customer status", error?.response?.data?.detail);
      set({ loading: false });
    }
  }
}));
