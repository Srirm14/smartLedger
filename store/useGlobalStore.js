import { create } from "zustand";
const getTodayDate = () => new Date().toISOString().split("T")[0];

const useGlobalDateStore = create((set) => ({
  selectedDate: localStorage.getItem("selectedDate") || getTodayDate(),
  InventorySelectedDate: localStorage.getItem("InventorySelectedDate") || getTodayDate(),
  IslandSelectedDate: localStorage.getItem("IslandSelectedDate") || getTodayDate(),
  CashflowSelectedDate: localStorage.getItem("CashflowSelectedDate") || getTodayDate(),

  setSelectedDate: async (date) => {
    try {
      localStorage.setItem("selectedDate", date);
      set({ selectedDate: date });
      // Update all module-specific dates
      set({ 
        InventorySelectedDate: date,
        IslandSelectedDate: date,
        CashflowSelectedDate: date
      });
      // Update localStorage for all module-specific dates
      localStorage.setItem("InventorySelectedDate", date);
      localStorage.setItem("IslandSelectedDate", date);
      localStorage.setItem("CashflowSelectedDate", date);
    } catch (error) {
      console.error("Failed to set selected date:", error);
    }
  },

  setInventorySelectedDate: async (date) => {
    try {
      localStorage.setItem("InventorySelectedDate", date);
      set({ InventorySelectedDate: date });
    } catch (error) {
      console.error("Failed to set selected date:", error);
    }
  },

  setIslandSelectedDate: async (date) => {
    try {
      localStorage.setItem("IslandSelectedDate", date);
      set({ IslandSelectedDate: date });
    } catch (error) {
      console.error("Failed to set selected date:", error);
    }
  },

  setCashflowSelectedDate: async (date) => {
    try {
      localStorage.setItem("CashflowSelectedDate", date);
      set({ CashflowSelectedDate: date });
    } catch (error) {
      console.error("Failed to set selected date:", error);
    }
  },

  resetCashflowSelectedDate: async () => {
    try {
      localStorage.removeItem("CashflowSelectedDate");
      const defaultDate = getTodayDate();
      set({ CashflowSelectedDate: defaultDate });
    } catch (error) {
      console.error("Failed to reset CashflowSelectedDate:", error);
    }
  },

  resetInventorySelectedDate: async () => {
    try {
      localStorage.removeItem("InventorySelectedDate");
      const defaultDate = getTodayDate();
      set({ InventorySelectedDate: defaultDate });
    } catch (error) {
      console.error("Failed to reset InventorySelectedDate:", error);
    }
  },

  resetIslandSelectedDate: async () => {
    try {
      localStorage.removeItem("IslandSelectedDate");
      const defaultDate = getTodayDate();
      set({ IslandSelectedDate: defaultDate });
    } catch (error) {
      console.error("Failed to reset IslandSelectedDate:", error);
    }
  },

  resetAllDates: async () => {
    try {
      const defaultDate = getTodayDate();
      // Clear all localStorage items
      localStorage.removeItem("selectedDate");
      localStorage.removeItem("InventorySelectedDate");
      localStorage.removeItem("IslandSelectedDate");
      localStorage.removeItem("CashflowSelectedDate");
      // Reset all dates to default
      set({ 
        selectedDate: defaultDate,
        InventorySelectedDate: defaultDate,
        IslandSelectedDate: defaultDate,
        CashflowSelectedDate: defaultDate
      });
    } catch (error) {
      console.error("Failed to reset all dates:", error);
    }
  }
}));

export default useGlobalDateStore;
