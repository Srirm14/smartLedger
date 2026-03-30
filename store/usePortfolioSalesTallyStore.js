import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { getTallySummary } from '../src/services/apiService';

const usePortfolioSalesTallyStore = create(
  devtools((set) => ({
    tallySummary: null,
    loading: false,
    error: null,

    fetchTallySummary: async (portfolio_id, date, shiftId) => {
      set({ loading: true, error: null });
      try {
        const data = await getTallySummary(portfolio_id, date, shiftId);
        set({ tallySummary: data, loading: false });
      } catch (error) {
        set({ error: 'Failed to fetch tally summary', loading: false });
      }
    },
    fetchTallySummaryByDate: async(date) => {
      set({ loading: true, error: null });
      try {
        const data = await getTallySummaryByDate(date);
        set({ tallySummary: data, loading: false });
      } catch (error) {
        set({ error: 'Failed to fetch tally summary', loading: false });
      }
    }
  }))
);

export default usePortfolioSalesTallyStore;
