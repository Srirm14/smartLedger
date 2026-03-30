import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import {
  getCustomer,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  toggleCustomerStatus
} from '../../services/apiService';
import { 
  QUERY_KEYS, 
  createQueryOptions, 
  createMutationOptions 
} from '../../utils/queryConfig';

function sortCustomersNewestFirst(list) {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    if (tb !== ta) return tb - ta;
    return Number(b.id) - Number(a.id);
  });
}

// Hook for fetching customers
export const useCustomers = (filters = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.CUSTOMER.list(filters),
    queryFn: async () => {
      const response = await getCustomer();
      return sortCustomersNewestFirst(Object.values(response || {}));
    },
    ...createQueryOptions({
      enabled: true, // Always enabled for customer list
    }),
  });
};

// Hook for fetching a single customer
export const useCustomer = (customerId) => {
  return useQuery({
    queryKey: QUERY_KEYS.CUSTOMER.detail(customerId),
    queryFn: async () => {
      const response = await getCustomer();
      const customers = sortCustomersNewestFirst(Object.values(response || {}));
      return customers.find(customer => customer.id === customerId);
    },
    ...createQueryOptions({
      enabled: Boolean(customerId),
    }),
  });
};

// Hook for adding a new customer
export const useAddCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customer) => {
      const toastId = toast.loading('Adding customer...');
      try {
        const response = await addCustomer(customer);
        toast.success('Customer added successfully', { id: toastId });
        return response;
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'Error adding customer';
        toast.error(errorMessage, { id: toastId });
        throw error;
      }
    },
    ...createMutationOptions({
      onSuccess: (data, variables) => {
        // Invalidate customer lists to refetch data
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.CUSTOMER.lists(),
          refetchType: 'all' 
        });
      },
      onError: (error) => {
        // Error is already handled in mutationFn
        console.error('Error adding customer:', error);
      },
    }),
  });
};

// Hook for updating a customer
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customer) => {
      const toastId = toast.loading('Updating customer...');
      try {
        const response = await updateCustomer(customer);
        toast.success('Customer updated successfully', { id: toastId });
        return response;
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'Error updating customer';
        toast.error(errorMessage, { id: toastId });
        throw error;
      }
    },
    ...createMutationOptions({
      onSuccess: (data, variables) => {
        // Invalidate customer lists and specific customer detail
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.CUSTOMER.lists(),
          refetchType: 'all' 
        });
        if (variables.id) {
          queryClient.invalidateQueries({ 
            queryKey: QUERY_KEYS.CUSTOMER.detail(variables.id),
            refetchType: 'all' 
          });
        }
      },
      onError: (error) => {
        // Error is already handled in mutationFn
        console.error('Error updating customer:', error);
      },
    }),
  });
};

// Hook for deleting a customer
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerId) => {
      const toastId = toast.loading('Deleting customer...');
      try {
        const response = await deleteCustomer(customerId);
        toast.success('Customer deleted successfully', { id: toastId });
        return response;
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'Error deleting customer';
        toast.error(errorMessage, { id: toastId });
        throw error;
      }
    },
    ...createMutationOptions({
      onSuccess: (data, variables) => {
        // Invalidate customer lists to refetch data
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.CUSTOMER.lists(),
          refetchType: 'all' 
        });
      },
      onError: (error) => {
        // Error is already handled in mutationFn
        console.error('Error deleting customer:', error);
      },
    }),
  });
};

// Hook for toggling customer status
export const useToggleCustomerStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customerId) => {
      const toastId = toast.loading('Updating customer status...');
      try {
        const response = await toggleCustomerStatus(customerId);
        const status = response.is_active ? 'activated' : 'deactivated';
        toast.success(`Customer ${status} successfully`, { id: toastId });
        return response;
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'Error updating customer status';
        toast.error(errorMessage, { id: toastId });
        throw error;
      }
    },
    ...createMutationOptions({
      onSuccess: (data, variables) => {
        // Invalidate customer lists and specific customer detail
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.CUSTOMER.lists(),
          refetchType: 'all' 
        });
        if (variables) {
          queryClient.invalidateQueries({ 
            queryKey: QUERY_KEYS.CUSTOMER.detail(variables),
            refetchType: 'all' 
          });
        }
      },
      onError: (error) => {
        // Error is already handled in mutationFn
        console.error('Error updating customer status:', error);
      },
    }),
  });
}; 