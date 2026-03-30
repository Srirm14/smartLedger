// Global React Query Configuration
// This file contains all query-related configurations and constants

// Query Configuration Constants
export const QUERY_CONFIG = {
  // Default query settings
  DEFAULT_STALE_TIME: 5 * 60 * 1000, // 5 minutes
  DEFAULT_CACHE_TIME: 10 * 60 * 1000, // 10 minutes
  DEFAULT_RETRY: 1,
  DEFAULT_REFETCH_ON_WINDOW_FOCUS: false,
  
  // Real-time data settings (for frequently changing data)
  REALTIME_STALE_TIME: 0, // Consider data stale immediately
  REALTIME_CACHE_TIME: 5 * 60 * 1000, // 5 minutes
  REALTIME_REFETCH_ON_WINDOW_FOCUS: true,
  REALTIME_REFETCH_ON_MOUNT: true,
  
  // Tab-based data settings (for data that shouldn't refetch on tab switch)
  TAB_STALE_TIME: 2 * 60 * 1000, // 2 minutes - shorter than default but not immediate
  TAB_CACHE_TIME: 10 * 60 * 1000, // 10 minutes
  TAB_REFETCH_ON_WINDOW_FOCUS: false,
  TAB_REFETCH_ON_MOUNT: false,
  
  // Static data settings (for rarely changing data)
  STATIC_STALE_TIME: 30 * 60 * 1000, // 30 minutes
  STATIC_CACHE_TIME: 60 * 60 * 1000, // 1 hour
  
  // Mutation settings
  MUTATION_RETRY: 1,
  MUTATION_RETRY_DELAY: 1000, // 1 second
};

// Toast Configuration
export const TOAST_CONFIG = {
  DURATION: 4000,
  POSITION: 'top-right',
  LOADING_DURATION: 2000,
};

// Query Key Factory - Centralized query key management
export const QUERY_KEYS = {
  // Inventory related keys
  INVENTORY: {
    all: ['inventory'],
    lists: () => [...QUERY_KEYS.INVENTORY.all, 'list'],
    list: (date) => [...QUERY_KEYS.INVENTORY.lists(), date],
    details: () => [...QUERY_KEYS.INVENTORY.all, 'detail'],
    detail: (id) => [...QUERY_KEYS.INVENTORY.details(), id],
    linkedPortfolio: (id) => [...QUERY_KEYS.INVENTORY.all, 'linkedPortfolio', id],
  },
  
  // Sales related keys
  SALES: {
    all: ['sales'],
    products: (portfolioId, shiftId, date) => ['salesProducts', portfolioId, shiftId, date],
    meterReadings: (portfolioId, shiftId, date) => ['meterReadings', portfolioId, shiftId, date],
  },
  
  // Cashflow related keys
  CASHFLOW: {
    all: ['cashflow'],
    data: (portfolioId, shiftId, date) => ['cashflow', portfolioId, shiftId, date],
    summary: (portfolioId, shiftId, date) => ['cashflowSummary', portfolioId, shiftId, date],
  },
  
  // Customer related keys
  CUSTOMER: {
    all: ['customers'],
    lists: () => [...QUERY_KEYS.CUSTOMER.all, 'list'],
    list: (filters) => [...QUERY_KEYS.CUSTOMER.lists(), { filters }],
    details: () => [...QUERY_KEYS.CUSTOMER.all, 'detail'],
    detail: (id) => [...QUERY_KEYS.CUSTOMER.details(), id],
    credit: (customerId) => [...QUERY_KEYS.CUSTOMER.all, 'credit', customerId],
  },
  
  // Portfolio related keys
  PORTFOLIO: {
    all: ['portfolios'],
    lists: () => [...QUERY_KEYS.PORTFOLIO.all, 'list'],
    list: (filters) => [...QUERY_KEYS.PORTFOLIO.lists(), { filters }],
    details: () => [...QUERY_KEYS.PORTFOLIO.all, 'detail'],
    detail: (id) => [...QUERY_KEYS.PORTFOLIO.details(), id],
  },
  
  // Employee related keys
  EMPLOYEE: {
    all: ['employees'],
    lists: () => [...QUERY_KEYS.EMPLOYEE.all, 'list'],
    list: (filters) => [...QUERY_KEYS.EMPLOYEE.lists(), { filters }],
    details: () => [...QUERY_KEYS.EMPLOYEE.all, 'detail'],
    detail: (id) => [...QUERY_KEYS.EMPLOYEE.details(), id],
    attendance: (employeeId, date) => [...QUERY_KEYS.EMPLOYEE.all, 'attendance', employeeId, date],
  },
  
  // Reports related keys
  REPORTS: {
    all: ['reports'],
    sales: (date, filters) => [...QUERY_KEYS.REPORTS.all, 'sales', date, filters],
    cashflow: (date, filters) => [...QUERY_KEYS.REPORTS.all, 'cashflow', date, filters],
    inventory: (date, filters) => [...QUERY_KEYS.REPORTS.all, 'inventory', date, filters],
  },
  
  // User/Profile related keys
  USER: {
    all: ['user'],
    profile: () => [...QUERY_KEYS.USER.all, 'profile'],
    settings: () => [...QUERY_KEYS.USER.all, 'settings'],
  },
};

// Default query options factory
export const createQueryOptions = (options = {}) => ({
  refetchOnWindowFocus: QUERY_CONFIG.DEFAULT_REFETCH_ON_WINDOW_FOCUS,
  retry: QUERY_CONFIG.DEFAULT_RETRY,
  staleTime: QUERY_CONFIG.DEFAULT_STALE_TIME,
  cacheTime: QUERY_CONFIG.DEFAULT_CACHE_TIME,
  ...options,
});

// Real-time query options (for frequently changing data)
export const createRealtimeQueryOptions = (options = {}) => ({
  refetchOnWindowFocus: QUERY_CONFIG.REALTIME_REFETCH_ON_WINDOW_FOCUS,
  refetchOnMount: QUERY_CONFIG.REALTIME_REFETCH_ON_MOUNT,
  retry: QUERY_CONFIG.DEFAULT_RETRY,
  staleTime: QUERY_CONFIG.REALTIME_STALE_TIME,
  cacheTime: QUERY_CONFIG.REALTIME_CACHE_TIME,
  ...options,
});

// Tab-based query options (for data that shouldn't refetch on tab switch)
export const createTabQueryOptions = (options = {}) => ({
  refetchOnWindowFocus: QUERY_CONFIG.TAB_REFETCH_ON_WINDOW_FOCUS,
  refetchOnMount: QUERY_CONFIG.TAB_REFETCH_ON_MOUNT,
  retry: QUERY_CONFIG.DEFAULT_RETRY,
  staleTime: QUERY_CONFIG.TAB_STALE_TIME,
  cacheTime: QUERY_CONFIG.TAB_CACHE_TIME,
  ...options,
});

// Static query options (for rarely changing data)
export const createStaticQueryOptions = (options = {}) => ({
  refetchOnWindowFocus: false,
  retry: QUERY_CONFIG.DEFAULT_RETRY,
  staleTime: QUERY_CONFIG.STATIC_STALE_TIME,
  cacheTime: QUERY_CONFIG.STATIC_CACHE_TIME,
  ...options,
});

// Default mutation options factory
export const createMutationOptions = (options = {}) => ({
  retry: QUERY_CONFIG.MUTATION_RETRY,
  retryDelay: QUERY_CONFIG.MUTATION_RETRY_DELAY,
  ...options,
});

// Helper function to invalidate related queries
export const invalidateRelatedQueries = async (queryClient, baseKey, relatedKeys = []) => {
  const queriesToInvalidate = [baseKey, ...relatedKeys];
  
  await Promise.all(
    queriesToInvalidate.map(queryKey =>
      queryClient.invalidateQueries({ queryKey, refetchType: 'all' })
    )
  );
};

// Helper function to prefetch queries
export const prefetchQuery = async (queryClient, queryKey, queryFn, options = {}) => {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
    ...createQueryOptions(options),
  });
};

// Helper function to update query data
export const updateQueryData = (queryClient, queryKey, updater) => {
  queryClient.setQueryData(queryKey, updater);
};

// Helper function to get query data
export const getQueryData = (queryClient, queryKey) => {
  return queryClient.getQueryData(queryKey);
};

// Helper function to cancel queries
export const cancelQueries = async (queryClient, queryKey) => {
  await queryClient.cancelQueries({ queryKey });
}; 