import { create } from 'zustand';
import { getAllInventory, addInventory, updateInventoryAlert, getStockDetails, getStockDetailsHeader, getStockTransactionHistory, getStockMeterReadingHistory, addStockTransactions, updateStockTransactions, deleteStockTransactions, deleteStock } from '../src/pages/Inventory/api/inventoryService';
import { toast } from 'react-hot-toast';

export const useStockManagementStore = create((set, get) => ({
  // State
  stockItems: [],
  loading: false,
  error: null,
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setPageSize: (size) => set({ pageSize: size }),

  // Fetch all stock items
  fetchStockItems: async () => {
    try {
      set({ loading: true, error: null });
      const response = await getAllInventory();
      set({
        stockItems: response || [],
        totalItems: response.data?.length || 0,
        loading: false
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Add new stock item
  addStockItem: async (stockData) => {
    try {
      set({ loading: true, error: null });
      const response = await addInventory(stockData);
      if (response) {
        await get().fetchStockItems();
      }
      set({ loading: false });
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Delete stock item
  deleteStockItem: async (stockId) => {
    try {
      set({ error: null });
      const response = await deleteStock(stockId);
      if (response.status === "success") {
        toast.success(response.message || "Stock deleted successfully");
        await get().fetchStockItems();
      } else {
        throw new Error(response.message || "Failed to delete stock");
      }
      return response;
    } catch (error) {
      set({ error: error.message });
      toast.error(error.message || "Failed to delete stock");
      throw error;
    }
  },

  // Update stock alert settings
  updateStockAlert: async (id, status, lowStockLimit) => {
    try {
      set({ loading: true, error: null });
      const response = await updateInventoryAlert(id, status, lowStockLimit);
      if (response) {
        set((state) => ({
          stockItems: state.stockItems.map((item) =>
            item.id === id
              ? { ...item, status, low_stock_limit: lowStockLimit }
              : item
          ),
          loading: false
        }));
      }
      return response;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Get paginated items
  getPaginatedItems: () => {
    const { stockItems, currentPage, pageSize } = get();
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return stockItems.slice(startIndex, endIndex);
  }
}));

export const useStockDetailsStore = create((set, get) => ({
  // Real data state
  stockDetails: null,
  stockDetailsLoading: false,
  stockDetailsError: null,
  stockHeader: null,
  stockHeaderLoading: false,
  stockHeaderError: null,
  stockTransactions: [],
  stockTransactionsLoading: false,
  stockTransactionsError: null,
  stockSalesHistory: [],
  stockSalesHistoryLoading: false,
  stockSalesHistoryError: null,

  // Actions
  fetchStockDetails: async (id) => {
    try {
      set({ stockDetailsLoading: true, stockDetailsError: null });
      const response = await getStockDetails(id);
      set({ 
        stockDetails: response[0] || null,
        stockDetailsLoading: false 
      });
    } catch (error) {
      set({ stockDetailsError: error.message, stockDetailsLoading: false });
    }
  },

  fetchStockHeader: async (id, date) => {
    try {
      set({ stockHeaderLoading: true, stockHeaderError: null });
      const response = await getStockDetailsHeader(id, date);
      set({ 
        stockHeader: response || null,
        stockHeaderLoading: false 
      });
    } catch (error) {
      set({ stockHeaderError: error.message, stockHeaderLoading: false });
    }
  },

  fetchStockTransactions: async (id) => {
    try {
      set({ stockTransactionsLoading: true, stockTransactionsError: null });

      const response = await getStockTransactionHistory(id);
      const transactionsArray = Object.values(response).map(tx => ({
        id: tx.transaction_id,
        date: new Date(tx.date),
        type: tx.transaction_type,
        quantity: tx.quantity,
        amount: tx.amount,
        reference_no: tx.reference_no,
        notes: tx.notes || ""
      }));
      set({ 
        stockTransactions: transactionsArray,
        stockTransactionsLoading: false 
      });
    } catch (error) {
      set({ stockTransactionsError: error.message, stockTransactionsLoading: false });
    }
  },

  fetchStockSalesHistory: async (id) => {
    try {
      set({ stockSalesHistoryLoading: true, stockSalesHistoryError: null });
      const response = await getStockMeterReadingHistory(id);
      const salesArray = Object.values(response).map(sale => ({
        sales_unit_id: sale.sales_unit_id,
        date: new Date(sale.date),
        sold_quantity: sale.sold_quantity,
        amount: sale.amount
      }));
      set({ 
        stockSalesHistory: salesArray,
        stockSalesHistoryLoading: false 
      });
    } catch (error) {
      set({ stockSalesHistoryError: error.message, stockSalesHistoryLoading: false });
    }
  },

  // Helper getters
  getStockDetails: () => get().stockDetails,
  getStockHeader: () => get().stockHeader,
  getStockTransactions: () => get().stockTransactions,
  getStockSalesHistory: () => get().stockSalesHistory,

  // Update low stock alert settings
  updateLowStockAlert: async (id, enabled, threshold) => {
    try {
      set({ stockDetailsLoading: true });
      const response = await updateInventoryAlert(id, enabled, threshold);
      if (response) {
        set(state => ({
          stockDetails: state.stockDetails ? {
            ...state.stockDetails,
            low_stock_alert: enabled,
            low_stock_limit: threshold
          } : null
        }));
      }
      set({ stockDetailsLoading: false });
      return response;
    } catch (error) {
      set({ stockDetailsError: error.message, stockDetailsLoading: false });
      throw error;
    }
  },

  // Transaction actions
  addStockTransaction: async (data) => {
    try {
      set({ stockTransactionsLoading: true, stockTransactionsError: null });
      const response = await addStockTransactions(data);
      if (response.status === "success") {
        toast.success(response.message || "Stock added successfully");
        await get().fetchStockTransactions(data.stock_id);
      } else {
        throw new Error(response.message || "Failed to add stock");
      }
      set({ stockTransactionsLoading: false });
      return response;
    } catch (error) {
      set({ stockTransactionsError: error.message, stockTransactionsLoading: false });
      toast.error(error.message || "Failed to add stock");
      throw error;
    }
  },

  updateStockTransaction: async (data) => {
    try {
      set({ stockTransactionsLoading: true, stockTransactionsError: null });
      const response = await updateStockTransactions(data);
      if (response.status === "success") {
        toast.success(response.message || "Transaction updated successfully");
        await get().fetchStockTransactions(data.stock_id);
      } else {
        throw new Error(response.message || "Failed to update transaction");
      }
      set({ stockTransactionsLoading: false });
      return response;
    } catch (error) {
      set({ stockTransactionsError: error.message, stockTransactionsLoading: false });
      toast.error(error.message || "Failed to update transaction");
      throw error;
    }
  },

  deleteStockTransaction: async (data) => {
    try {
      set({ stockTransactionsLoading: true, stockTransactionsError: null });
      const response = await deleteStockTransactions(data);
      if (response.status === "success") {
        toast.success(response.message || "Transaction deleted successfully");
        await get().fetchStockTransactions(data.stock_id);
      } else {
        throw new Error(response.message || "Failed to delete transaction");
      }
      set({ stockTransactionsLoading: false });
      return response;
    } catch (error) {
      set({ stockTransactionsError: error.message, stockTransactionsLoading: false });
      toast.error(error.message || "Failed to delete transaction");
      throw error;
    }
  }
}));