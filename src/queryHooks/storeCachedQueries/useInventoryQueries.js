import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getInventory,
  addInventoryProduct,
  updateInventoryPrice,
  deleteInventoryProduct,
  updateProductStatus
} from '../../services/apiService';
import { toast } from 'react-hot-toast';
import { 
  QUERY_KEYS, 
  createTabQueryOptions, 
  createMutationOptions,
} from '../../utils/queryConfig';
import { normalizeInventoryResponse } from '../../lib/inventorySort';

// Hook for fetching inventory products
export const useInventoryProducts = (date) => {
  return useQuery({
    queryKey: QUERY_KEYS.INVENTORY.list(date),
    queryFn: async () => {
      const response = await getInventory(date);
      return normalizeInventoryResponse(response);
    },
    ...createTabQueryOptions({
      enabled: Boolean(date),
    }),
  });
};

// Hook for adding a new inventory product
export const useAddInventoryProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newProduct) => {
      const toastId = toast.loading('Adding product...');
      try {
        const response = await addInventoryProduct(newProduct);
        toast.success('Product added successfully', { id: toastId });
        return response;
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'Error adding product';
        toast.error(errorMessage, { id: toastId });
        throw error;
      }
    },
    ...createMutationOptions({
      onSuccess: (data, variables) => {
        // Invalidate inventory lists to refetch data
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.INVENTORY.lists(),
          refetchType: 'all' 
        });
      },
      onError: (error) => {
        // Error is already handled in mutationFn
        console.error('Error adding product:', error);
      },
    }),
  });
};

// Hook for updating inventory price
export const useUpdateInventoryPrice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, price, date }) => {
      const toastId = toast.loading('Updating price...');
      try {
        const response = await updateInventoryPrice({ id, name, price, date });
        toast.success('Product price updated successfully', { id: toastId });
        return response;
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'Error updating product price';
        toast.error(errorMessage, { id: toastId });
        throw error;
      }
    },
    ...createMutationOptions({
      onSuccess: (data, variables) => {
        // Invalidate inventory lists to refetch data
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.INVENTORY.lists(),
          refetchType: 'all' 
        });
      },
      onError: (error) => {
        // Error is already handled in mutationFn
        console.error('Error updating product price:', error);
      },
    }),
  });
};

// Hook for updating product status (active/inactive)
export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isDiscontinued, date }) => {
      const status = isDiscontinued ? 'inactive' : 'active';
      const toastId = toast.loading(`Updating product status to ${status}...`);
      try {
        const response = await updateProductStatus(id, isDiscontinued);
        toast.success(`Product status updated to ${status}`, { id: toastId });
        return response;
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'Error updating product status';
        toast.error(errorMessage, { id: toastId });
        throw error;
      }
    },
    ...createMutationOptions({
      onSuccess: (data, variables) => {
        // Invalidate inventory lists to refetch data
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.INVENTORY.lists(),
          refetchType: 'all' 
        });
      },
      onError: (error) => {
        // Error is already handled in mutationFn
        console.error('Error updating product status:', error);
      },
    }),
  });
};

// Hook for deleting inventory product
export const useDeleteInventoryProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, date }) => {
      const toastId = toast.loading('Deleting product...');
      try {
        const response = await deleteInventoryProduct(productId, date);
        toast.success('Product deleted successfully', { id: toastId });
        return response;
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'Error deleting product';
        toast.error(errorMessage, { id: toastId });
        throw error;
      }
    },
    ...createMutationOptions({
      onSuccess: (data, variables) => {
        // Invalidate inventory lists to refetch data
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.INVENTORY.lists(),
          refetchType: 'all' 
        });
      },
      onError: (error) => {
        // Error is already handled in mutationFn
        console.error('Error deleting product:', error);
      },
    }),
  });
}; 