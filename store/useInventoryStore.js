import { create } from "zustand";
import {
  addInventoryProduct,
  deleteInventoryProduct,
  getInventory,
  getLinkedPortfolio,
  updateInventoryPrice,
  updateProductStatus
} from "../src/services/apiService";
import { toast } from "react-hot-toast";

const useInventoryStore = create((set) => ({
  inventoryProducts: [],
  productlinkedPortfolio: {},
  linkedPortfolioLoading: false,
  loading: false,
  errorState: null,
   // Async actions with optimistic updates
   fetchInventoryProducts: async (date) => {
    set({ loading: true, errorState: null });
    try {
      const response = await getInventory(date);
      if (response && typeof response === "object") {
        const products = Object.values(response).map((item) => ({
          id: item.id,
          product: item.product,
          category: item.category,
          price: item.price,
          uom: item.uom,
          discontinued: item.discontinued,
          createdAt: item.created_at,
        }));
        set({ inventoryProducts: products, errorState: null });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || "Failed to fetch inventory products";
      set({ errorState: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },
   //Add Inventory Product
   addInventoryProduct: async (newProduct) => {
    set({ loading: true, errorState: null });
    try {
      const response = await addInventoryProduct(newProduct);
      set((state) => ({
        inventoryProducts: [...state.inventoryProducts, newProduct],
        loading: false,
        errorState: null,
      }));
      toast.success("Product added successfully");
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || "Error adding product";
      set({ 
        errorState: errorMessage,
        loading: false 
      });
      toast.error(errorMessage);
      throw error; // Re-throw to allow catch in component
    }
  },
  updateInventoryPrice: async (productDetails, selectedDate) => {
    set({ loading: true, errorState: null });
    try {
      const updatedProductPrice = {
        id: productDetails.id,
        name: productDetails.name,
        price: productDetails.price,
        date: selectedDate,
      };
      const response = await updateInventoryPrice(updatedProductPrice);
      set((state) => ({
        inventoryProducts: state.inventoryProducts.map((item) =>
          item.id === productDetails.id
            ? { ...item, price: productDetails.price }
            : item
        ),
        errorState: null,
      }));
      toast.success("Product price updated successfully");
      set({loading: false});
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.detail || "Error updating product price";
      set({ 
        errorState: errorMessage,
        loading: false 
      });
      toast.error(errorMessage);
      throw error;
    }
  },
  //Delete Inventory Product
  deleteInventoryProduct: async (productToDelete, date) => {
    // Optimistic update
    set((state) => ({
      inventoryProducts: state.inventoryProducts.filter(item => item.id !== productToDelete),
      loading: true,
      errorState: null
    }));

    try {
      await deleteInventoryProduct(productToDelete, date);
      toast.success("Product deleted successfully");
    } catch (error) {
      const errorMessage = error.response?.data?.detail || "Error deleting product";
      // Revert optimistic update in case of error
      set((state) => ({
        inventoryProducts: [...state.inventoryProducts, { id: productToDelete }],
        loading: false,
        errorState: errorMessage
      }));
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
    //Update Product Status
  updateProductStatus: async (id, isDiscontinued) => {
    await updateProductStatus(id, isDiscontinued);
},
   // Get linked portfolio details
  getLinkedPortfolio: async (id) => {
    set({ linkedPortfolioLoading: true }); // Set loading to true before fetching
    try {
      const response = await getLinkedPortfolio(id);
      if (response) {
        const portfolioDetails = Object.keys(response).map((key) => ({
          productId: id,
          portfolioName: response[key]?.portfolio_name || "Unknown Portfolio",
        }));

        set({
          productlinkedPortfolio: portfolioDetails,
        });
      }
    } catch (err) {
      console.error("Failed to get linked portfolio:", err);
    } finally {
      set({ linkedPortfolioLoading: false });
    }
  },
}));

export default useInventoryStore;
