import { create } from "zustand";
import { get_filter_credit } from "../src/services/apiService";

export const useAllCreditStore = create(set => ({
    AllCredit: [],
    CreditForDate: [],
    total_count: 0,
    loading: false,
    fetchAllCredit: async (page,filter) => {
        set({ loading: true });
        const data = await get_filter_credit(page,filter);
        set((state)=>{
            // if(state.AllCredit.length === 0){
                return { AllCredit: Object.values(data.data), total_count: data.total_count };
            // }
            // return { AllCredit: state.AllCredit.concat(Object.values(data.data)), total_count: data.total_count };
        });
        set({ loading: false });
    },
    fetchCreditForDate: async (page,date) => {
        const filter =  [{"dateRange":{"startDate":date,"endDate":date}}]
        set({ loading: true });
        const data = await get_filter_credit(page,filter);
        set((state)=>{
            return { CreditForDate: Object.values(data.data), total_count: data.total_count };
        });
        set({ loading: false });
    },
    FetchDataRetrival: async (page,filter) => {
        set({ loading: true });
        const data = await get_filter_credit(page,filter);
        set((state)=>{
            return { AllCredit: state.AllCredit.concat(Object.values(data.data)) };
        });
        set({ loading: false });
    }
}))




