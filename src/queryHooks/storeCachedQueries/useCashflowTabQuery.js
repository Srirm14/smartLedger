import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  getCashflow,
  bulkUpsertCashflow as bulkUpsertCashflowApi,
  deleteCashflow as deleteCashflowApi,
  DeleteAllCashflow as deleteAllCashflowApi,
  getIslandShiftSpecificCashflowSummary as getIslandShiftSpecificCashflowSummaryApi,
} from "@/services/apiService";

function sortIslandRowsByIdDesc(rows) {
  if (!Array.isArray(rows)) return [];
  return [...rows].sort((a, b) => Number(b?.id) - Number(a?.id));
}
import { 
  QUERY_KEYS, 
  createTabQueryOptions, 
  createMutationOptions 
} from "@/utils/queryConfig";

// Centralized function to invalidate all cashflow queries
export const invalidateAllCashflowQueries = async (queryClient) => {
  try {
    // Method 1: Invalidate specific query keys
    await queryClient.invalidateQueries({ 
      queryKey: ['cashflow'],
      refetchType: 'all'
    });
    await queryClient.invalidateQueries({ 
      queryKey: ['cashflowSummary'],
      refetchType: 'all'
    });
    
    // Method 2: Invalidate reports-related cashflow queries
    await queryClient.invalidateQueries({ 
      queryKey: ['reports', 'cashflow'],
      refetchType: 'all'
    });
    
    // Method 3: Use predicate to invalidate all cashflow-related queries
    await queryClient.invalidateQueries({ 
      predicate: (query) => 
        query.queryKey[0] === 'cashflow' || 
        query.queryKey[0] === 'cashflowSummary' ||
        (query.queryKey[0] === 'reports' && query.queryKey[1] === 'cashflow')
    });
    
    // Method 4: Remove all cashflow-related queries from cache
    queryClient.removeQueries({ 
      predicate: (query) => 
        query.queryKey[0] === 'cashflow' || 
        query.queryKey[0] === 'cashflowSummary' ||
        (query.queryKey[0] === 'reports' && query.queryKey[1] === 'cashflow')
    });
    
    console.log("Cashflow queries invalidated and removed from cache successfully");
  } catch (error) {
    console.error('Error invalidating cashflow queries:', error);
  }
};

export const useCashflowTabQuery = (portfolioId, shiftId, date) => {
  const queryClient = useQueryClient();

  // Query for fetching cashflow data
  const {
    data: cashflowData = [],
    isLoading: isCashflowLoading,
    error: cashflowError,
  } = useQuery({
    queryKey: QUERY_KEYS.CASHFLOW.data(portfolioId, shiftId, date),
    queryFn: async () => {
      try {
        const response = await getCashflow(shiftId, portfolioId, date);
        const list = Array.isArray(response) ? response : Object.values(response || {});
        return sortIslandRowsByIdDesc(list);
      } catch (error) {
        console.error("Error fetching cashflow data:", error);
        throw error;
      }
    },
    ...createTabQueryOptions({
      enabled: Boolean(portfolioId && shiftId && date),
    }),
  });

  // Query for fetching cashflow summary
  const {
    data: cashflowSummary = {
      net_income: 0,
      expense: 0,
      credit: 0,
      total_cashflow: 0,
      total_sales: 0,
    },
    isLoading: isSummaryLoading,
    error: summaryError,
  } = useQuery({
    queryKey: QUERY_KEYS.CASHFLOW.summary(portfolioId, shiftId, date),
    queryFn: async () => {
      try {
        const response = await getIslandShiftSpecificCashflowSummaryApi(date, shiftId, portfolioId);
        return response;
      } catch (error) {
        console.error("Error fetching cashflow summary:", error);
        throw error;
      }
    },
    ...createTabQueryOptions({
      enabled: Boolean(portfolioId && shiftId && date),
    }),
  });

  // Mutation for bulk upserting cashflow entries
  const { mutate: upsertCashflow, isLoading: isUpserting } = useMutation({
    mutationFn: async (data) => {
      const toastId = toast.loading("Saving cashflow entries...");
      try {
        const response = await bulkUpsertCashflowApi(data);
        toast.success("Cashflow entries saved successfully", { id: toastId });
        return response;
      } catch (error) {
        toast.error("Error updating cashflow entries", { id: toastId });
        throw error;
      }
    },
    ...createMutationOptions({
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.CASHFLOW.data(portfolioId, shiftId, date),
          refetchType: "all",
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.CASHFLOW.summary(portfolioId, shiftId, date),
          refetchType: "all",
        });
      },
      onError: (error) => {
        console.error("Error updating cashflow entries:", error);
      },
    }),
  });

  const { mutate: deleteAllCashflowMutation, isLoading: isDeletingAll } = useMutation({
    mutationFn: async ({ date: d, portfolioId: pid, shiftId: sid }) => {
      const toastId = toast.loading("Deleting all cashflow entries...");
      try {
        await deleteAllCashflowApi(d, pid, sid);
        toast.success("All cashflow entries removed for this shift", { id: toastId });
      } catch (error) {
        toast.error("Failed to delete all cashflow entries", { id: toastId });
        throw error;
      }
    },
    ...createMutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.CASHFLOW.data(portfolioId, shiftId, date),
          refetchType: "all",
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.CASHFLOW.summary(portfolioId, shiftId, date),
          refetchType: "all",
        });
      },
      onError: (error) => {
        console.error("Error deleting all cashflow:", error);
      },
    }),
  });

  // Mutation for deleting a cashflow entry
  const { mutate: deleteCashflowMutation, isLoading: isDeleting } = useMutation({
    mutationFn: async (id) => {
      const toastId = toast.loading("Deleting cashflow entry...");
      try {
        const response = await deleteCashflowApi(id);
        toast.success("Cashflow entry deleted successfully", { id: toastId });
        return response;
      } catch (error) {
        toast.error("Failed to delete cashflow entry", { id: toastId });
        throw error;
      }
    },
    ...createMutationOptions({
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.CASHFLOW.data(portfolioId, shiftId, date),
          refetchType: "all",
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.CASHFLOW.summary(portfolioId, shiftId, date),
          refetchType: "all",
        });
      },
      onError: (error) => {
        console.error("Error deleting cashflow entry:", error);
      },
    }),
  });

  return {
    // Data
    cashflowData,
    cashflowSummary,
    
    // Loading states
    isCashflowLoading,
    isSummaryLoading,
    isUpserting,
    isDeleting,
    isDeletingAll,
    
    // Error states
    cashflowError,
    summaryError,
    
    // Mutations
    upsertCashflow,
    deleteCashflowMutation,
    deleteAllCashflowMutation,
    
    // Utility functions
    invalidateAllCashflowQueries: () => invalidateAllCashflowQueries(queryClient),
  };
}; 