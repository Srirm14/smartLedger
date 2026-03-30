import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  getSales_unit,
  bulkUpsertMeterReadings as bulkUpsertMeterReadingsApi,
  deleteSalesUnit as deleteSalesUnitApi,
  changeMeterReadingStatus as changeMeterReadingStatusApi,
} from "@/services/apiService";
import { 
  QUERY_KEYS, 
  createTabQueryOptions, 
  createMutationOptions 
} from "@/utils/queryConfig";

export const useSalesTabQuery = (portfolioId, shiftId, date) => {
  const queryClient = useQueryClient();

  // Query for fetching sales products
  const {
    data: salesProducts = [],
    isLoading: isSalesProductsListLoading,
    error: salesProductsError,
  } = useQuery({
    queryKey: QUERY_KEYS.SALES.products(portfolioId, shiftId, date),
    queryFn: async () => {
      try {
        const response = await getSales_unit(portfolioId, shiftId, date);
        // Convert object to array if needed
        return Array.isArray(response) ? response : Object.values(response);
      } catch (error) {
        console.error("Error fetching sales products:", error);
        throw error;
      }
    },
    ...createTabQueryOptions({
      enabled: Boolean(portfolioId && shiftId && date),
    }),
  });

  // Mutation for bulk upserting meter readings
  const { mutate: upsertMeterReadings, isLoading: isUpserting } = useMutation({
    mutationFn: async (data) => {
      const toastId = toast.loading("Saving sales products...");
      try {
        const response = await bulkUpsertMeterReadingsApi(data);
        toast.success("Sales products saved successfully", { id: toastId });
        return response;
      } catch (error) {
        toast.error("Error updating meter readings", { id: toastId });
        throw error;
      }
    },
    ...createMutationOptions({
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.SALES.products(portfolioId, shiftId, date),
          refetchType: "all",
        });
      },
      onError: (error) => {
        console.error("Error updating meter readings:", error);
      },
    }),
  });

  // Mutation for deleting a sales unit
  const { mutate: deleteSalesUnitMutation, isLoading: isDeleting } = useMutation({
    mutationFn: async (id) => {
      const toastId = toast.loading("Deleting sales unit...");
      try {
        const response = await deleteSalesUnitApi(id);
        toast.success("Sales unit deleted successfully", { id: toastId });
        return response;
      } catch (error) {
        toast.error("Failed to delete sales unit", { id: toastId });
        throw error;
      }
    },
    ...createMutationOptions({
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.SALES.products(portfolioId, shiftId, date),
          refetchType: "all",
        });
      },
      onError: (error) => {
        console.error("Error deleting sales unit:", error);
      },
    }),
  });

  // Mutation for updating meter reading status
  const { mutate: updateMeterReadingStatus, isLoading: isUpdatingStatus } = useMutation({
    mutationFn: async (id) => {
      const toastId = toast.loading("Updating status...");
      try {
        const response = await changeMeterReadingStatusApi(id);
        toast.success("Status updated successfully", { id: toastId });
        return response;
      } catch (error) {
        toast.error("Failed to update status", { id: toastId });
        throw error;
      }
    },
    ...createMutationOptions({
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.SALES.products(portfolioId, shiftId, date),
          refetchType: "all",
        });
      },
      onError: (error) => {
        console.error("Error updating status:", error);
      },
    }),
  });

  return {
    // Data
    salesProducts,
    
    // Loading states
    isSalesProductsListLoading,
    isUpserting,
    isDeleting,
    isUpdatingStatus,
    
    // Error state
    salesProductsError,
    
    // Mutations
    upsertMeterReadings,
    deleteSalesUnitMutation,
    updateMeterReadingStatus,
  };
}; 