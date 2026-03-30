# React Query Migration Summary

## Overview
This document summarizes the migration of React Query (TanStack Query) configuration from hardcoded values to a centralized, global configuration system. The migration removes optimistic updates for Sales, Cashflow, and Inventory tabs and implements proper loading states and toast messages.

## Files Created/Modified

### New Files Created

1. **`src/utils/queryConfig.js`**
   - Global configuration constants for query settings
   - Centralized query key factory
   - Helper functions for creating query and mutation options
   - Utility functions for cache management

2. **`src/utils/queryUtils.js`**
   - Additional utility functions for React Query
   - Error handling helpers
   - Data transformation helpers
   - Cache management utilities

3. **`src/hooks/useCustomerQueries.js`**
   - Example implementation of customer queries using new pattern
   - Demonstrates proper usage of global configuration

4. **`src/utils/README.md`**
   - Comprehensive documentation of the new query system
   - Usage patterns and best practices
   - Migration guide

5. **`QUERY_MIGRATION_SUMMARY.md`** (this file)
   - Summary of all changes made

### Files Modified

1. **`src/utils/queryClient.js`**
   - Updated to use global configuration constants
   - Removed hardcoded values
   - Re-exported query keys from config

2. **`src/hooks/useInventoryQueries.js`**
   - Removed optimistic updates
   - Implemented simple loading states and toast messages
   - Updated to use global query keys and configuration
   - Added proper error handling

3. **`src/hooks/useSalesTabQuery.js`**
   - Removed optimistic updates
   - Implemented simple loading states and toast messages
   - Updated to use global query keys and configuration
   - Added proper error handling

4. **`src/hooks/useCashflowTabQuery.js`**
   - Removed optimistic updates
   - Implemented simple loading states and toast messages
   - Updated to use global query keys and configuration
   - Added proper error handling

## Key Changes Made

### 1. Global Configuration System

**Before:**
```javascript
// Hardcoded values scattered across files
staleTime: 5 * 60 * 1000,
cacheTime: 10 * 60 * 1000,
retry: 1,
refetchOnWindowFocus: false,
```

**After:**
```javascript
// Centralized configuration
export const QUERY_CONFIG = {
  DEFAULT_STALE_TIME: 5 * 60 * 1000,
  DEFAULT_CACHE_TIME: 10 * 60 * 1000,
  DEFAULT_RETRY: 1,
  DEFAULT_REFETCH_ON_WINDOW_FOCUS: false,
  // ... more configurations
};
```

### 2. Query Key Management

**Before:**
```javascript
// Inconsistent query keys across files
queryKey: ["salesProducts", portfolioId, shiftId, date],
queryKey: ["cashflow", portfolioId, shiftId, date],
```

**After:**
```javascript
// Centralized query keys
export const QUERY_KEYS = {
  SALES: {
    products: (portfolioId, shiftId, date) => ['salesProducts', portfolioId, shiftId, date],
  },
  CASHFLOW: {
    data: (portfolioId, shiftId, date) => ['cashflow', portfolioId, shiftId, date],
  },
};
```

### 3. Removed Optimistic Updates

**Before:**
```javascript
// Complex optimistic update logic
onMutate: async (newProduct) => {
  await queryClient.cancelQueries({ queryKey: inventoryKeys.lists() });
  const previousProducts = queryClient.getQueryData(inventoryKeys.lists());
  const toastId = toast.loading('Adding product...');
  queryClient.setQueryData(inventoryKeys.lists(), (old) => {
    return [...(old || []), { ...newProduct, id: tempId }];
  });
  return { previousProducts, toastId };
},
```

**After:**
```javascript
// Simple loading states and toast messages
...createMutationOptions({
  onSuccess: (data, variables) => {
    toast.success('Product added successfully');
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
```

### 4. Standardized Error Handling

**Before:**
```javascript
// Inconsistent error handling
onError: (err, newProduct, context) => {
  queryClient.setQueryData(inventoryKeys.lists(), context.previousProducts);
  const errorMessage = err.response?.data?.detail || 'Error adding product';
  toast.error(errorMessage, { id: context.toastId });
},
```

**After:**
```javascript
// Consistent error handling
onError: (error) => {
  const errorMessage = error.response?.data?.detail || 'Error adding product';
  toast.error(errorMessage);
},
```

## Benefits of the Migration

### 1. **Consistency**
- All queries now use the same configuration patterns
- Consistent error handling across the application
- Standardized loading states and user feedback

### 2. **Maintainability**
- Global configuration makes it easy to change settings across the entire application
- Centralized query keys prevent cache conflicts
- Clear separation of concerns

### 3. **Performance**
- Removed complex optimistic update logic that could cause data inconsistencies
- Better cache management with proper invalidation patterns
- Optimized query configurations for different data types

### 4. **Developer Experience**
- Clear documentation and examples
- Reusable utility functions
- Type-safe query key management

### 5. **User Experience**
- Consistent loading states across all tabs
- Clear success and error messages
- No more confusing optimistic updates that might be incorrect

## Configuration Options Available

### Query Types
1. **Standard Queries** (`createQueryOptions`)
   - Default caching behavior
   - 5-minute stale time
   - 10-minute cache time

2. **Real-time Queries** (`createRealtimeQueryOptions`)
   - For frequently changing data (Sales, Cashflow)
   - Immediate stale time
   - Refetch on window focus and mount

3. **Static Queries** (`createStaticQueryOptions`)
   - For rarely changing data
   - 30-minute stale time
   - 1-hour cache time

### Mutation Options
- Standardized retry behavior
- Consistent error handling
- Proper query invalidation patterns

## Usage Examples

### Creating a Query
```javascript
import { QUERY_KEYS, createQueryOptions } from '../utils/queryConfig';

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
```

### Creating a Mutation
```javascript
import { QUERY_KEYS, createMutationOptions } from '../utils/queryConfig';

const useAddInventoryProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addInventoryProduct,
    ...createMutationOptions({
      onSuccess: (data, variables) => {
        toast.success('Product added successfully');
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

## Next Steps

1. **Migrate Remaining Queries**: Update any remaining query files to use the new pattern
2. **Add TypeScript**: Consider adding TypeScript for better type safety
3. **Performance Monitoring**: Monitor query performance and adjust configurations as needed
4. **Testing**: Add comprehensive tests for the new query system
5. **Documentation**: Keep documentation updated as new patterns emerge

## Conclusion

The migration to a centralized React Query configuration system provides better consistency, maintainability, and user experience. The removal of optimistic updates for Sales, Cashflow, and Inventory tabs ensures data consistency while maintaining good user feedback through loading states and toast messages. 