import { create } from "zustand";
import { addCustomer, getCustomer, updateCustomer, deleteCustomer, toggleCustomerStatus } from "../src/services/apiService";
import toast from "react-hot-toast";

/** Newest customers first (matches mock `created_at` + numeric id). */
function sortCustomersNewestFirst(list) {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    if (tb !== ta) return tb - ta;
    return Number(b.id) - Number(a.id);
  });
}

export const useCustomerStore = create((set) => ({
  customers: [],
  
  loading: false,
  setCustomers: (customers) => set({ customers }),
  setLoading: (loading) => set({ loading }),

  fetchCustomers: async () => {
    set({ loading: true });
    try {
      const data = await getCustomer(); 
      set({ customers: sortCustomersNewestFirst(Object.values(data || {})) });
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
      set({ loading: false });
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
        customers: sortCustomersNewestFirst(
          state.customers.map((c) =>
            c.id === customer.id
              ? {
                  ...c,
                  customer_name: customer.name,
                  name: customer.name,
                  email: customer.email,
                  contact_phone: customer.contact_phone,
                  credit_limit: customer.credit_limit,
                }
              : c
          )
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
        customers: sortCustomersNewestFirst(
          state.customers.filter((c) => c.id !== customerId)
        ),
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
      const res = await toggleCustomerStatus(customerId);
      const nextActive = res?.is_active;
      set((state) => ({
        customers: sortCustomersNewestFirst(
          state.customers.map((c) =>
            c.id === customerId
              ? {
                  ...c,
                  is_active:
                    typeof nextActive === "boolean" ? nextActive : !c.is_active,
                }
              : c
          )
        ),
        loading: false
      }));
    } catch (error) {
      console.error("Failed to toggle customer status", error?.response?.data?.detail);
      set({ loading: false });
    }
  }
}));
