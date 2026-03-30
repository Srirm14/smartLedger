import { QueryClient } from '@tanstack/react-query';
import { QUERY_CONFIG } from './queryConfig';

// Default query client configuration using global settings
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: QUERY_CONFIG.DEFAULT_REFETCH_ON_WINDOW_FOCUS,
      retry: QUERY_CONFIG.DEFAULT_RETRY,
      staleTime: QUERY_CONFIG.DEFAULT_STALE_TIME,
      cacheTime: QUERY_CONFIG.DEFAULT_CACHE_TIME,
    },
    mutations: {
      retry: QUERY_CONFIG.MUTATION_RETRY,
    },
  },
});

// Re-export query keys from config for convenience
export { QUERY_KEYS } from './queryConfig';

// Helper function to invalidate queries
export const invalidateQueries = async (queryKey) => {
  await queryClient.invalidateQueries({ queryKey });
};

// Helper function to prefetch queries
export const prefetchQuery = async (queryKey, queryFn) => {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
  });
};

// Helper function to update query data
export const updateQueryData = (queryKey, updater) => {
  queryClient.setQueryData(queryKey, updater);
}; 