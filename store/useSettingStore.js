import { addShiftConfig, disableShiftConfig, EditShiftDetails, getPortfolio, getShiftConfig, toggleShiftStatus, deleteShift, getPortfolioShifts } from "@/services/apiService";
import { create } from "zustand";
import { toast } from "react-hot-toast";

export const useShiftConfigStore = create((set) => ({ 
    shiftConfig: [],
    isLoading: false,
    error: null,
    shifts: [],

    // Helper function to transform shift data
    transformShiftData: (shiftConfigAll) => {
        const portfolioMap = {};
        Object.values(shiftConfigAll).forEach(shift => {
            if (!portfolioMap[shift.portfolio]) {
                portfolioMap[shift.portfolio] = {
                    portfolio_id: shift.portfolio_id,
                    portfolio_name: shift.portfolio_name,
                    shifts: []
                };
            }
            portfolioMap[shift.portfolio].shifts.push({
                shift_id: shift.shift_id,
                shift_name: shift.shift_name,
                shift_start_time: shift.shift_start_time,
                shift_end_time: shift.shift_end_time,
                start_date: shift.start_date,
                end_date: shift.end_date,
                shift_start_timestamp: shift.shift_start_timestamp,
                active: shift.active,
                day_span: shift.day_span
            });
        });
        return Object.values(portfolioMap);
    },

    fetchShiftConfig: async (date) => {
        set({ isLoading: true });
        try {
            const shiftConfigAll = await getShiftConfig(date);
            const shiftConfig = useShiftConfigStore.getState().transformShiftData(shiftConfigAll);
            set({ shiftConfig });
        } catch (error) {
            set({ error: error.message });
        } finally {
            set({ isLoading: false });
        }
    },
    
    AddShiftConfigPortfolio: async (shiftConfig) => {
        set({ isLoading: true, error: null });
        try {
            const response = await addShiftConfig({
                ...shiftConfig,
                portfolio_id: shiftConfig.portfolio_id
            });
            if (response) {
                set({ isLoading: false });
            }
        } catch (error) {
            set({ error: error.message, isLoading: false });
        } finally {
            set({ isLoading: false });
        }
    },

    EditShiftConfigPortfolio: async (shiftConfig) => {
        set({ isLoading: true, error: null });
        try {
            const response = await EditShiftDetails({
                ...shiftConfig,
                portfolio_id: shiftConfig.portfolio_id
            });
            if (response) {
                set({ isLoading: false });
                toast.success(response.message);
            }
        } catch (error) {
            set({ error: error.message, isLoading: false });
            toast.error(error.message);
        } finally {
            set({ isLoading: false });
        }
    },

    disableShiftConfigPortfolio: async (disablePayload) => {
        if (!disablePayload || !disablePayload.portfolio_id || !disablePayload.shift_name || !disablePayload.end_date) {
            set({ error: 'Invalid payload: portfolio_id, shift_name, and end_date are required', isLoading: false });
            return;
        }

        set({ isLoading: true, error: null });
        
        try {
            const response = await disableShiftConfig(disablePayload);
            
            if (response) {
                set({ 
                    isLoading: false,
                    error: null,
                    success: 'Shift configuration disabled successfully'
                });
                toast.success('Shift configuration disabled successfully');
                return response;
            }
        } catch (error) {
            const errorMessage = error.message || 'Failed to disable shift configuration';
            set({ 
                error: errorMessage,
                isLoading: false,
                success: null
            });
            toast.error(errorMessage);
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    toggleShiftStatus: async (islandId, shiftId, currentActive) => {
        set({ isLoading: true, error: null });
        try {
            const response = await toggleShiftStatus(islandId, shiftId, currentActive);
            if (response) {
                const shiftConfig = useShiftConfigStore.getState().transformShiftData(response.updatedData);
                set({ shiftConfig, isLoading: false });
                toast.success(response.message);
                return response;
            }
        } catch (error) {
            const errorMessage = error.message || 'Failed to update shift status';
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    deleteShift: async (shiftId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await deleteShift(shiftId);
            if (response) {
                const shiftConfig = useShiftConfigStore.getState().transformShiftData(response.updatedData);
                set({ shiftConfig, isLoading: false });
                toast.success(response.message);
                return response;
            }
        } catch (error) {
            const errorMessage = error.message || 'Failed to delete shift';
            set({ error: errorMessage, isLoading: false });
            toast.error(errorMessage);
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    fetchPortfolioShifts: async (portfolioId, date) => {
        set({ isLoading: true, error: null });
        try {
            const response = await getPortfolioShifts(portfolioId, date);
            const formattedShifts = Object.values(response).map((shift, index) => ({
                portfolio_id: shift.portfolio_id,
                shift_id: shift.id,
                key: `shift-${index}`,
                label: shift.shift_name,
                startTime: shift.shift_start_time,
                endTime: shift.shift_end_time,
                timestamp: `${date}T${shift.shift_start_time}Z`,
                active: shift.active
            })).sort((a, b) => {
                const timeA = new Date(`2000/01/01 ${a.startTime}`).getTime();
                const timeB = new Date(`2000/01/01 ${b.startTime}`).getTime();
                return timeA - timeB;
            });
            set({ shifts: formattedShifts, isLoading: false });
        } catch (error) {
            console.error("Error fetching portfolio shifts:", error);
            set({ error: error.message, isLoading: false });
        }
    },

    clearShifts: () => set({ shifts: [], error: null }),
}));














