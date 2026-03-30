import { create } from "zustand";

export const useCreditNavigationStore = create((set, get) => ({
  // Navigation state for credit entries
  creditNavigationState: {
    isNavigating: false,
    filters: {
      dateRange: null,
      portfolioName: null,
      shiftName: null,
      islandName: null,
    },
    sourceComponent: null,
  },

  // Set navigation state with filters
  setCreditNavigationState: (state) => set({ creditNavigationState: state }),

  // Clear navigation state
  clearCreditNavigationState: () => set({
    creditNavigationState: {
      isNavigating: false,
      filters: {
        dateRange: null,
        portfolioName: null,
        shiftName: null,
        islandName: null,
      },
      sourceComponent: null,
    }
  }),

  // Navigate to credit entries with specific filters
  navigateToCreditEntries: (filters, sourceComponent = "cashflowTab") => {
    set({
      creditNavigationState: {
        isNavigating: true,
        filters,
        sourceComponent,
      }
    });
  },

  // Get current navigation state
  getCreditNavigationState: () => get().creditNavigationState,
})); 