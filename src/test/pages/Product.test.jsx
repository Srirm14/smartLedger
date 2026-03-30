import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductList from '@/pages/Product/ProductList';
import ProductDetails from '@/pages/Product/ProductDetails';
import ProductForm from '@/pages/Product/ProductForm';

// Mock the product service
vi.mock('@/services/product', () => ({
  getProducts: vi.fn(),
  getProductById: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

// Mock data
const mockProducts = [
  {
    id: '1',
    name: 'Product 1',
    description: 'Description 1',
    price: 99.99,
    stock: 100,
    category: 'Category 1',
    sku: 'SKU001',
  },
  {
    id: '2',
    name: 'Product 2',
    description: 'Description 2',
    price: 149.99,
    stock: 50,
    category: 'Category 2',
    sku: 'SKU002',
  },
];

describe('Product Pages', () => {
  describe('ProductList Page', () => {
    beforeEach(() => {
      getProducts.mockResolvedValue(mockProducts);
      render(
        <BrowserRouter>
          <ProductList />
        </BrowserRouter>
      );
    });

    it('renders product list with search and add button', () => {
      expect(screen.getByPlaceholderText(/search products/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add product/i })).toBeInTheDocument();
    });

    it('displays list of products', async () => {
      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
        expect(screen.getByText('Product 2')).toBeInTheDocument();
        expect(screen.getByText('$99.99')).toBeInTheDocument();
        expect(screen.getByText('$149.99')).toBeInTheDocument();
      });
    });

    it('filters products based on search input', async () => {
      const searchInput = screen.getByPlaceholderText(/search products/i);
      fireEvent.change(searchInput, { target: { value: 'Product 1' } });

      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
        expect(screen.queryByText('Product 2')).not.toBeInTheDocument();
      });
    });

    it('sorts products by price', async () => {
      const sortButton = screen.getByRole('button', { name: /sort by price/i });
      fireEvent.click(sortButton);

      await waitFor(() => {
        const prices = screen.getAllByText(/\$\d+\.\d+/);
        expect(prices[0]).toHaveTextContent('$99.99');
        expect(prices[1]).toHaveTextContent('$149.99');
      });
    });
  });

  describe('ProductDetails Page', () => {
    const mockProduct = mockProducts[0];

    beforeEach(() => {
      getProductById.mockResolvedValue(mockProduct);
      render(
        <BrowserRouter>
          <ProductDetails />
        </BrowserRouter>
      );
    });

    it('displays product details', async () => {
      await waitFor(() => {
        expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
        expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
        expect(screen.getByText(`$${mockProduct.price}`)).toBeInTheDocument();
        expect(screen.getByText(mockProduct.stock.toString())).toBeInTheDocument();
        expect(screen.getByText(mockProduct.category)).toBeInTheDocument();
        expect(screen.getByText(mockProduct.sku)).toBeInTheDocument();
      });
    });

    it('handles edit button click', async () => {
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(window.location.pathname).toBe(`/products/${mockProduct.id}/edit`);
      });
    });

    it('handles delete confirmation', async () => {
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(deleteProduct).toHaveBeenCalledWith(mockProduct.id);
      });
    });
  });

  describe('ProductForm Page', () => {
    beforeEach(() => {
      render(
        <BrowserRouter>
          <ProductForm />
        </BrowserRouter>
      );
    });

    it('renders product form with all required fields', () => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/price/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/stock/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/sku/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('shows validation errors for empty required fields', async () => {
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/price is required/i)).toBeInTheDocument();
        expect(screen.getByText(/stock is required/i)).toBeInTheDocument();
        expect(screen.getByText(/sku is required/i)).toBeInTheDocument();
      });
    });

    it('validates price and stock are positive numbers', async () => {
      const priceInput = screen.getByLabelText(/price/i);
      const stockInput = screen.getByLabelText(/stock/i);
      const saveButton = screen.getByRole('button', { name: /save/i });

      fireEvent.change(priceInput, { target: { value: '-10' } });
      fireEvent.change(stockInput, { target: { value: '-5' } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/price must be positive/i)).toBeInTheDocument();
        expect(screen.getByText(/stock must be positive/i)).toBeInTheDocument();
      });
    });

    it('handles successful form submission', async () => {
      const nameInput = screen.getByLabelText(/name/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const priceInput = screen.getByLabelText(/price/i);
      const stockInput = screen.getByLabelText(/stock/i);
      const categoryInput = screen.getByLabelText(/category/i);
      const skuInput = screen.getByLabelText(/sku/i);
      const saveButton = screen.getByRole('button', { name: /save/i });

      fireEvent.change(nameInput, { target: { value: 'New Product' } });
      fireEvent.change(descriptionInput, { target: { value: 'New Description' } });
      fireEvent.change(priceInput, { target: { value: '199.99' } });
      fireEvent.change(stockInput, { target: { value: '75' } });
      fireEvent.change(categoryInput, { target: { value: 'New Category' } });
      fireEvent.change(skuInput, { target: { value: 'SKU003' } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(createProduct).toHaveBeenCalledWith({
          name: 'New Product',
          description: 'New Description',
          price: 199.99,
          stock: 75,
          category: 'New Category',
          sku: 'SKU003',
        });
      });
    });
  });
}); 