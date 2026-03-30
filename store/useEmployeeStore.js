import { create } from "zustand";
import {
  createEmployeeApi,
  deleteEmployeeApi,
  getEmployeesApi,
  getEmployeeApi,
  updateEmployeeApi,
} from "/src/services/apiService.js";

const useEmployeeStore = create((set, get) => ({
  employees: [],
  currentEmployee: null,
  loading: false,
  error: null,

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Fetch all employees
  fetchEmployees: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getEmployeesApi();
      const list = Array.isArray(data) ? data : [];
      list.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
      set({
        employees: list,
      });
    } catch (error) {
      set({ error: error.message });
      console.error("Error fetching employees", error);
    } finally {
      set({ loading: false });
    }
  },

  // Fetch single employee
  fetchEmployee: async (id) => {
    set({ loading: true, error: null });
    try {
      const data = await getEmployeeApi(id);
      set({ currentEmployee: data });
      return data;
    } catch (error) {
      set({ error: error.message });
      console.error("Error fetching employee", error);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  // Add employee with optimistic update
  addEmployee: async (employeeData) => {
    set({ loading: true, error: null });
    try {
      const response = await createEmployeeApi(employeeData);
      set((state) => {
        const merged = [...state.employees, response];
        merged.sort((a, b) => (Number(b.id) || 0) - (Number(a.id) || 0));
        return { employees: merged };
      });
      return response;
    } catch (error) {
      set({ error: error.message });
      console.error("Failed to add employee", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Update employee with optimistic update and refresh
  updateEmployee: async (employeeData) => {
    set({ loading: true, error: null });
    try {
      await updateEmployeeApi(employeeData);
      
      // Fetch fresh data after successful update
      const updatedEmployee = await getEmployeeApi(employeeData.id);
      
      set((state) => ({
        employees: state.employees.map((emp) =>
          emp.id === employeeData.id ? updatedEmployee : emp
        ),
        currentEmployee:
          String(state.currentEmployee?.id) === String(employeeData.id)
            ? updatedEmployee
            : state.currentEmployee
      }));
      
      // Refresh the full employee list
      const allEmployees = await getEmployeesApi();
      set({ employees: allEmployees });
      
    } catch (error) {
      set({ error: error.message });
      console.error("Failed to update employee", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Delete employee with optimistic update
  deleteEmployee: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteEmployeeApi(id);
      set((state) => ({
        employees: state.employees.filter(
          (emp) => String(emp.id) !== String(id)
        ),
        currentEmployee:
          String(state.currentEmployee?.id) === String(id)
            ? null
            : state.currentEmployee
      }));
    } catch (error) {
      set({ error: error.message });
      console.error("Failed to delete employee", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Clear current employee
  clearCurrentEmployee: () => set({ currentEmployee: null }),
}));

export default useEmployeeStore;
