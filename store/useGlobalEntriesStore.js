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
      const raw = response && typeof response === "object" ? response : {};
      const arr = Array.isArray(raw)
        ? raw
        : Object.values(raw);
      arr.sort((a, b) => {
        const tb = new Date(b.date || 0).getTime();
        const ta = new Date(a.date || 0).getTime();
        if (tb !== ta) return tb - ta;
        return (Number(b.id) || 0) - (Number(a.id) || 0);
      });
      set({ globalEntries: arr, isLoading: false });
    } catch (error) {
      console.error('Error fetching global entries:', error);
      set({ error: error.message, isLoading: false });
      toast.error('Failed to fetch global entries');
    }
  },

  addGlobalEntry: async (entries) => {
    try {
      set({ isLoading: true, error: null });
      const response = await upsertCashflowApi(entries);
      if (response?.ok) {
        await get().fetchGlobalEntries();
        toast.success('Global entries added successfully');
      }
    } catch (error) {
      console.error('Error adding global entries:', error);
      set({ error: error.message, isLoading: false });
      toast.error('Failed to add global entries');
    } finally {
      set({ isLoading: false });
    }
  },

  updateGlobalEntry: async (entry) => {
    try {
      set({ isLoading: true, error: null });
      const response = await upsertCashflowApi([entry]);
      if (response?.ok) {
        await get().fetchGlobalEntries();
        toast.success('Global entry updated successfully');
      }
    } catch (error) {
      console.error('Error updating global entry:', error);
      set({ error: error.message, isLoading: false });
      toast.error('Failed to update global entry');
    } finally {
      set({ isLoading: false });
    }
  },

  deleteGlobalEntry: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const response = await deleteCashflowApi(id);
      if (response?.ok || response?.message) {
        await get().fetchGlobalEntries();
        toast.success('Global entry deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting global entry:', error);
      set({ error: error.message, isLoading: false });
      toast.error('Failed to delete global entry');
    } finally {
      set({ isLoading: false });
    }
  }
}));

export default useGlobalEntriesStore; 