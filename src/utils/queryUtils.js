// Additional utility functions for React Query
import { toast } from 'react-hot-toast';

// Generic error handler for mutations
export const handleMutationError = (error, defaultMessage = 'An error occurred') => {
  const errorMessage = error.response?.data?.detail || error.message || defaultMessage;
  toast.error(errorMessage);
  console.error('Mutation error:', error);
};

// Generic success handler for mutations
export const handleMutationSuccess = (message = 'Operation completed successfully') => {
  toast.success(message);
};

// Loading toast handler
export const showLoadingToast = (message = 'Loading...') => {
  return toast.loading(message);
};

// Update loading toast with success
export const updateLoadingToast = (toastId, message, type = 'success') => {
  if (type === 'success') {
    toast.success(message, { id: toastId });
  } else if (type === 'error') {
    toast.error(message, { id: toastId });
  }
};

// Debounced query invalidation
export const debouncedInvalidateQueries = (() => {
  let timeoutId;
  return (queryClient, queryKey, delay = 300) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey, refetchType: 'all' });
    }, delay);
  };
})();

// Batch query invalidation
export const batchInvalidateQueries = async (queryClient, queryKeys) => {
  await Promise.all(
    queryKeys.map(queryKey =>
      queryClient.invalidateQueries({ queryKey, refetchType: 'all' })
    )
  );
};

// Query data transformation helper
export const transformQueryData = (data, transformer) => {
  if (!data) return data;
  return Array.isArray(data) ? data.map(transformer) : transformer(data);
};

// Query enabled condition helper
export const createEnabledCondition = (...conditions) => {
  return conditions.every(Boolean);
};

// Query retry configuration helper
export const createRetryConfig = (retries = 1, delay = 1000) => ({
  retry: retries,
  retryDelay: delay,
});

// Query stale time helper
export const createStaleTimeConfig = (minutes = 5) => ({
  staleTime: minutes * 60 * 1000,
});

// Query cache time helper
export const createCacheTimeConfig = (minutes = 10) => ({
  cacheTime: minutes * 60 * 1000,
});

// Query refetch configuration helper
export const createRefetchConfig = (options = {}) => ({
  refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
  refetchOnMount: options.refetchOnMount ?? true,
  refetchOnReconnect: options.refetchOnReconnect ?? true,
});

// Mutation with loading toast wrapper
export const createMutationWithLoading = (mutationFn, options = {}) => {
  return {
    mutationFn: async (...args) => {
      const toastId = showLoadingToast(options.loadingMessage || 'Processing...');
      try {
        const result = await mutationFn(...args);
        updateLoadingToast(toastId, options.successMessage || 'Success!', 'success');
        return result;
      } catch (error) {
        updateLoadingToast(toastId, error.message || 'Error occurred', 'error');
        throw error;
      }
    },
    ...options,
  };
};

// Query data selector helper
export const createQuerySelector = (selector) => (data) => {
  if (!data) return data;
  return selector(data);
};

// Query data filter helper
export const createQueryFilter = (filterFn) => (data) => {
  if (!data || !Array.isArray(data)) return data;
  return data.filter(filterFn);
};

// Query data sort helper
export const createQuerySorter = (sortFn) => (data) => {
  if (!data || !Array.isArray(data)) return data;
  return [...data].sort(sortFn);
};

// Query pagination helper
export const createQueryPagination = (page, pageSize) => (data) => {
  if (!data || !Array.isArray(data)) return data;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return data.slice(startIndex, endIndex);
};

// Query search helper
export const createQuerySearch = (searchTerm, searchFields) => (data) => {
  if (!data || !Array.isArray(data) || !searchTerm) return data;
  const term = searchTerm.toLowerCase();
  return data.filter(item =>
    searchFields.some(field => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(term);
    })
  );
};

// Query data caching helper
export const createQueryCache = (key, data, ttl = 5 * 60 * 1000) => {
  const cacheEntry = {
    data,
    timestamp: Date.now(),
    ttl,
  };
  localStorage.setItem(`query_cache_${key}`, JSON.stringify(cacheEntry));
};

// Query data retrieval helper
export const getQueryCache = (key) => {
  try {
    const cached = localStorage.getItem(`query_cache_${key}`);
    if (!cached) return null;
    
    const cacheEntry = JSON.parse(cached);
    const isExpired = Date.now() - cacheEntry.timestamp > cacheEntry.ttl;
    
    if (isExpired) {
      localStorage.removeItem(`query_cache_${key}`);
      return null;
    }
    
    return cacheEntry.data;
  } catch (error) {
    console.error('Error retrieving query cache:', error);
    return null;
  }
};

// Query cache cleanup helper
export const cleanupQueryCache = () => {
  const keys = Object.keys(localStorage);
  const cacheKeys = keys.filter(key => key.startsWith('query_cache_'));
  
  cacheKeys.forEach(key => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return;
      
      const cacheEntry = JSON.parse(cached);
      const isExpired = Date.now() - cacheEntry.timestamp > cacheEntry.ttl;
      
      if (isExpired) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Error cleaning up query cache:', error);
      localStorage.removeItem(key);
    }
  });
}; 