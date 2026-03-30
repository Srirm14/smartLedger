# React Query Configuration & Best Practices

This directory contains the global configuration for React Query (TanStack Query) used throughout the Smart Ledger application.

## Files Overview

### `queryConfig.js`
Global configuration file containing:
- Query configuration constants (stale time, cache time, retry settings)
- Query key factory for centralized key management
- Helper functions for creating query and mutation options
- Utility functions for cache management

### `queryClient.js`
Main query client instance with default configuration using global settings.

## Configuration Constants

### Query Settings
```javascript
QUERY_CONFIG = {
  // Default settings for most queries
  DEFAULT_STALE_TIME: 5 * 60 * 1000, // 5 minutes
  DEFAULT_CACHE_TIME: 10 * 60 * 1000, // 10 minutes
  DEFAULT_RETRY: 1,
  DEFAULT_REFETCH_ON_WINDOW_FOCUS: false,
  
  // Real-time data settings (frequently changing data)
  REALTIME_STALE_TIME: 0, // Consider data stale immediately
  REALTIME_CACHE_TIME: 5 * 60 * 1000, // 5 minutes
  REALTIME_REFETCH_ON_WINDOW_FOCUS: true,
  REALTIME_REFETCH_ON_MOUNT: true,
  
  // Static data settings (rarely changing data)
  STATIC_STALE_TIME: 30 * 60 * 1000, // 30 minutes
  STATIC_CACHE_TIME: 60 * 60 * 1000, // 1 hour
}
```

## Query Key Management

All query keys are centralized in `QUERY_KEYS` object for better organization and type safety:

```javascript
QUERY_KEYS = {
  INVENTORY: {
    all: ['inventory'],
    lists: () => [...QUERY_KEYS.INVENTORY.all, 'list'],
    list: (date) => [...QUERY_KEYS.INVENTORY.lists(), date],
    details: () => [...QUERY_KEYS.INVENTORY.all, 'detail'],
    detail: (id) => [...QUERY_KEYS.INVENTORY.details(), id],
  },
  SALES: {
    all: ['sales'],
    products: (portfolioId, shiftId, date) => ['salesProducts', portfolioId, shiftId, date],
  },
  CASHFLOW: {
    all: ['cashflow'],
    data: (portfolioId, shiftId, date) => ['cashflow', portfolioId, shiftId, date],
    summary: (portfolioId, shiftId, date) => ['cashflowSummary', portfolioId, shiftId, date],
  },
  // ... more keys
}
```

## Usage Patterns

### 1. Creating Queries

```javascript
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS, createQueryOptions, createRealtimeQueryOptions } from '../utils/queryConfig';

// Standard query
const useInventoryProducts = (date) => {
  return useQuery({
    queryKey: QUERY_KEYS.INVENTORY.list(date),
    queryFn: async () => {
      const response = await getInventory(date);
      return transformInventoryResponse(response);
    },
    ...createQueryOptions({
      enabled: Boolean(date),
    }),
  });
};

// Real-time query (for frequently changing data)
const useCashflowData = (portfolioId, shiftId, date) => {
  return useQuery({
    queryKey: QUERY_KEYS.CASHFLOW.data(portfolioId, shiftId, date),
    queryFn: async () => {
      const response = await getCashflow(portfolioId, shiftId, date);
      return response;
    },
    ...createRealtimeQueryOptions({
      enabled: Boolean(portfolioId && shiftId && date),
    }),
  });
};
```

### 2. Creating Mutations

```javascript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { QUERY_KEYS, createMutationOptions } from '../utils/queryConfig';

const useAddInventoryProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addInventoryProduct,
    ...createMutationOptions({
      onSuccess: (data, variables) => {
        toast.success('Product added successfully');
        // Invalidate related queries
        queryClient.invalidateQueries({ 
          queryKey: QUERY_KEYS.INVENTORY.lists(),
          refetchType: 'all' 
        });
      },
      onError: (error) => {
        const errorMessage = error.response?.data?.detail || 'Error adding product';
        toast.error(errorMessage);
      },
    }),
  });
};
```

### 3. Using in Components

```javascript
import { useInventoryProducts, useAddInventoryProduct } from '../hooks/useInventoryQueries';

const InventoryComponent = () => {
  const { data: products, isLoading, error } = useInventoryProducts(selectedDate);
  const addProductMutation = useAddInventoryProduct();

  const handleAddProduct = async (productData) => {
    try {
      await addProductMutation.mutateAsync(productData);
    } catch (error) {
      // Error is handled by the mutation
      console.error('Failed to add product:', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
};
```

## Best Practices

### 1. No Optimistic Updates
For Sales, Cashflow, and Inventory tabs, we use simple loading states and toast messages instead of optimistic updates to ensure data consistency.

### 2. Proper Error Handling
Always provide meaningful error messages in toast notifications:
```javascript
onError: (error) => {
  const errorMessage = error.response?.data?.detail || 'Error message';
  toast.error(errorMessage);
}
```

### 3. Query Invalidation
Invalidate related queries after mutations to ensure data consistency:
```javascript
onSuccess: (data, variables) => {
  queryClient.invalidateQueries({ 
    queryKey: QUERY_KEYS.INVENTORY.lists(),
    refetchType: 'all' 
  });
}
```

### 4. Loading States
Use the `isLoading` state from queries and mutations to show loading indicators:
```javascript
const isLoading = isQueryLoading || isMutationLoading;
```

### 5. Query Key Consistency
Always use the centralized query keys from `QUERY_KEYS` to ensure consistency and avoid cache conflicts.

## Migration Guide

When migrating existing queries:

1. Replace hardcoded query keys with `QUERY_KEYS`
2. Replace hardcoded options with `createQueryOptions()` or `createRealtimeQueryOptions()`
3. Replace mutation options with `createMutationOptions()`
4. Remove optimistic updates and use simple loading states
5. Ensure proper error handling with toast messages
6. Use proper query invalidation patterns

## Performance Considerations

- Use `createRealtimeQueryOptions()` for frequently changing data (Sales, Cashflow)
- Use `createStaticQueryOptions()` for rarely changing data (User settings, static lists)
- Use `createQueryOptions()` for standard data with default caching
- Always enable/disable queries appropriately to avoid unnecessary API calls 