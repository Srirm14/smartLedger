import { create } from 'zustand';
import { getGlobalEntriesApi, upsertCashflowApi, deleteCashflowApi } from '../src/pages/Cashflow/API/apiService';
import { toast } from 'react-hot-toast';

const useGlobalEntriesStore = create((set, get) => ({
  globalEntries: [],
  isLoading: false,
  error: null,

  fetchGlobalEntries: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await getGlobalEntriesApi();
      if (response ) {
        set({ globalEntries: response, isLoading: false });
      } else {
        set({ globalEntries: [], isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching global entries:', error);
      set({ error: error.message, isLoading: false });
      toast.error('Failed to fetch global entries');
    }
  },

  addGlobalEntry: async (entries) => {
    try {
      set({ isLoading: true, error: null });
      const response = await upsertCashflowApi( entries );
      if (response.status) {
        await get().fetchGlobalEntries();
        toast.success('Global entries added successfully');
      }
    } catch (error) {
      console.error('Error adding global entries:', error);
      set({ error: error.message, isLoading: false });
      toast.error('Failed to add global entries');
    }
  },

  updateGlobalEntry: async (entry) => {
    try {
      set({ isLoading: true, error: null });
      const response = await upsertCashflowApi({ cashflow: [entry] });
      if (response.status) {
        await get().fetchGlobalEntries();
        toast.success('Global entry updated successfully');
      }
    } catch (error) {
      console.error('Error updating global entry:', error);
      set({ error: error.message, isLoading: false });
      toast.error('Failed to update global entry');
    }
  },

  deleteGlobalEntry: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await deleteCashflowApi(id);
      if (response.message) {
        await get().fetchGlobalEntries();
        toast.success('Global entry deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting global entry:', error);
      set({ error: error.message, isLoading: false });
      toast.error('Failed to delete global entry');
    }
  }
}));

export default useGlobalEntriesStore; 