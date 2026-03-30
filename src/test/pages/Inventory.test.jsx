import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import InventoryList from '@/pages/Inventory/InventoryList';
import InventoryDetails from '@/pages/Inventory/InventoryDetails';
import InventoryForm from '@/pages/Inventory/InventoryForm';

// Mock the inventory service
vi.mock('@/services/inventory', () => ({
  getInventoryItems: vi.fn(),
  getInventoryItemById: vi.fn(),
  createInventoryItem: vi.fn(),
  updateInventoryItem: vi.fn(),
  deleteInventoryItem: vi.fn(),
  adjustStock: vi.fn(),
}));

// Mock data
const mockInventoryItems = [
  {
    id: '1',
    productId: '1',
    productName: 'Product 1',
    quantity: 100,
    location: 'Warehouse A',
    lastUpdated: '2024-03-20T10:00:00Z',
    minimumStock: 20,
    maximumStock: 200,
  },
  {
    id: '2',
    productId: '2',
    productName: 'Product 2',
    quantity: 50,
    location: 'Warehouse B',
    lastUpdated: '2024-03-20T11:00:00Z',
    minimumStock: 10,
    maximumStock: 100,
  },
];

describe('Inventory Pages', () => {
  describe('InventoryList Page', () => {
    beforeEach(() => {
      getInventoryItems.mockResolvedValue(mockInventoryItems);
      render(
        <BrowserRouter>
          <InventoryList />
        </BrowserRouter>
      );
    });

    it('renders inventory list with search and add button', () => {
      expect(screen.getByPlaceholderText(/search inventory/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add inventory/i })).toBeInTheDocument();
    });

    it('displays list of inventory items', async () => {
      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
        expect(screen.getByText('Product 2')).toBeInTheDocument();
        expect(screen.getByText('Warehouse A')).toBeInTheDocument();
        expect(screen.getByText('Warehouse B')).toBeInTheDocument();
      });
    });

    it('filters inventory items based on search input', async () => {
      const searchInput = screen.getByPlaceholderText(/search inventory/i);
      fireEvent.change(searchInput, { target: { value: 'Product 1' } });

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
        expect(screen.queryByText('Product 2')).not.toBeInTheDocument();
      });
    });

    it('shows low stock warning for items below minimum stock', async () => {
      const lowStockItem = {
        ...mockInventoryItems[0],
        quantity: 10,
      };
      getInventoryItems.mockResolvedValue([lowStockItem]);

      render(
        <BrowserRouter>
          <InventoryList />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/low stock warning/i)).toBeInTheDocument();
      });
    });
  });

  describe('InventoryDetails Page', () => {
    const mockInventoryItem = mockInventoryItems[0];

    beforeEach(() => {
      getInventoryItemById.mockResolvedValue(mockInventoryItem);
      render(
        <BrowserRouter>
          <InventoryDetails />
        </BrowserRouter>
      );
    });

    it('displays inventory item details', async () => {
      await waitFor(() => {
        expect(screen.getByText(mockInventoryItem.productName)).toBeInTheDocument();
        expect(screen.getByText(mockInventoryItem.quantity.toString())).toBeInTheDocument();
        expect(screen.getByText(mockInventoryItem.location)).toBeInTheDocument();
        expect(screen.getByText(mockInventoryItem.minimumStock.toString())).toBeInTheDocument();
        expect(screen.getByText(mockInventoryItem.maximumStock.toString())).toBeInTheDocument();
      });
    });

    it('handles stock adjustment', async () => {
      const adjustButton = screen.getByRole('button', { name: /adjust stock/i });
      fireEvent.click(adjustButton);

      const quantityInput = screen.getByLabelText(/adjustment quantity/i);
      const reasonInput = screen.getByLabelText(/adjustment reason/i);
      const submitButton = screen.getByRole('button', { name: /submit/i });

      fireEvent.change(quantityInput, { target: { value: '10' } });
      fireEvent.change(reasonInput, { target: { value: 'Stock count' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(adjustStock).toHaveBeenCalledWith(mockInventoryItem.id, 10, 'Stock count');
      });
    });

    it('handles edit button click', async () => {
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(window.location.pathname).toBe(`/inventory/${mockInventoryItem.id}/edit`);
      });
    });
  });

  describe('InventoryForm Page', () => {
    beforeEach(() => {
      render(
        <BrowserRouter>
          <InventoryForm />
        </BrowserRouter>
      );
    });

    it('renders inventory form with all required fields', () => {
      expect(screen.getByLabelText(/product/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/minimum stock/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/maximum stock/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('shows validation errors for empty required fields', async () => {
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/product is required/i)).toBeInTheDocument();
        expect(screen.getByText(/quantity is required/i)).toBeInTheDocument();
        expect(screen.getByText(/location is required/i)).toBeInTheDocument();
      });
    });

    it('validates minimum stock is less than maximum stock', async () => {
      const minimumStockInput = screen.getByLabelText(/minimum stock/i);
      const maximumStockInput = screen.getByLabelText(/maximum stock/i);
      const saveButton = screen.getByRole('button', { name: /save/i });

      fireEvent.change(minimumStockInput, { target: { value: '100' } });
      fireEvent.change(maximumStockInput, { target: { value: '50' } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/minimum stock must be less than maximum stock/i)).toBeInTheDocument();
      });
    });

    it('handles successful form submission', async () => {
      const productInput = screen.getByLabelText(/product/i);
      const quantityInput = screen.getByLabelText(/quantity/i);
      const locationInput = screen.getByLabelText(/location/i);
      const minimumStockInput = screen.getByLabelText(/minimum stock/i);
      const maximumStockInput = screen.getByLabelText(/maximum stock/i);
      const saveButton = screen.getByRole('button', { name: /save/i });

      fireEvent.change(productInput, { target: { value: '1' } });
      fireEvent.change(quantityInput, { target: { value: '75' } });
      fireEvent.change(locationInput, { target: { value: 'Warehouse C' } });
      fireEvent.change(minimumStockInput, { target: { value: '20' } });
      fireEvent.change(maximumStockInput, { target: { value: '150' } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(createInventoryItem).toHaveBeenCalledWith({
          productId: '1',
          quantity: 75,
          location: 'Warehouse C',
          minimumStock: 20,
          maximumStock: 150,
        });
      });
    });
  });
}); 