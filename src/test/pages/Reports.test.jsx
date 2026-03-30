import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SalesReport from '@/pages/Reports/SalesReport';
import InventoryReport from '@/pages/Reports/InventoryReport';
import CustomerReport from '@/pages/Reports/CustomerReport';

// Mock the reports service
vi.mock('@/services/reports', () => ({
  getSalesReport: vi.fn(),
  getInventoryReport: vi.fn(),
  getCustomerReport: vi.fn(),
  exportReport: vi.fn(),
}));

// Mock data
const mockSalesData = {
  totalSales: 15000,
  totalOrders: 100,
  averageOrderValue: 150,
  salesByDate: [
    { date: '2024-03-01', amount: 5000 },
    { date: '2024-03-02', amount: 10000 },
  ],
  topProducts: [
    { name: 'Product 1', quantity: 50, revenue: 5000 },
    { name: 'Product 2', quantity: 30, revenue: 3000 },
  ],
};

const mockInventoryData = {
  totalItems: 500,
  lowStockItems: 10,
  outOfStockItems: 5,
  stockValue: 25000,
  stockByCategory: [
    { category: 'Category 1', quantity: 200, value: 10000 },
    { category: 'Category 2', quantity: 300, value: 15000 },
  ],
};

const mockCustomerData = {
  totalCustomers: 200,
  newCustomers: 20,
  activeCustomers: 150,
  customerLifetimeValue: 500,
  topCustomers: [
    { name: 'Customer 1', orders: 10, totalSpent: 2000 },
    { name: 'Customer 2', orders: 8, totalSpent: 1500 },
  ],
};

describe('Reports Pages', () => {
  describe('SalesReport Page', () => {
    beforeEach(() => {
      getSalesReport.mockResolvedValue(mockSalesData);
      render(
        <BrowserRouter>
          <SalesReport />
        </BrowserRouter>
      );
    });

    it('renders sales report with date range selector', () => {
      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /generate report/i })).toBeInTheDocument();
    });

    it('displays sales summary data', async () => {
      await waitFor(() => {
        expect(screen.getByText(/total sales/i)).toBeInTheDocument();
        expect(screen.getByText(/total orders/i)).toBeInTheDocument();
        expect(screen.getByText(/average order value/i)).toBeInTheDocument();
      });
    });

    it('displays sales chart', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('sales-chart')).toBeInTheDocument();
      });
    });

    it('displays top products table', async () => {
      await waitFor(() => {
        expect(screen.getByText('Product 1')).toBeInTheDocument();
        expect(screen.getByText('Product 2')).toBeInTheDocument();
      });
    });

    it('handles date range selection', async () => {
      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);
      const generateButton = screen.getByRole('button', { name: /generate report/i });

      fireEvent.change(startDateInput, { target: { value: '2024-03-01' } });
      fireEvent.change(endDateInput, { target: { value: '2024-03-31' } });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(getSalesReport).toHaveBeenCalledWith('2024-03-01', '2024-03-31');
      });
    });

    it('handles report export', async () => {
      const exportButton = screen.getByRole('button', { name: /export/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(exportReport).toHaveBeenCalledWith('sales', mockSalesData);
      });
    });
  });

  describe('InventoryReport Page', () => {
    beforeEach(() => {
      getInventoryReport.mockResolvedValue(mockInventoryData);
      render(
        <BrowserRouter>
          <InventoryReport />
        </BrowserRouter>
      );
    });

    it('renders inventory report with filters', () => {
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/stock status/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /generate report/i })).toBeInTheDocument();
    });

    it('displays inventory summary data', async () => {
      await waitFor(() => {
        expect(screen.getByText(/total items/i)).toBeInTheDocument();
        expect(screen.getByText(/low stock items/i)).toBeInTheDocument();
        expect(screen.getByText(/out of stock items/i)).toBeInTheDocument();
        expect(screen.getByText(/total stock value/i)).toBeInTheDocument();
      });
    });

    it('displays stock by category chart', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('inventory-chart')).toBeInTheDocument();
      });
    });

    it('handles filter selection', async () => {
      const categorySelect = screen.getByLabelText(/category/i);
      const statusSelect = screen.getByLabelText(/stock status/i);
      const generateButton = screen.getByRole('button', { name: /generate report/i });

      fireEvent.change(categorySelect, { target: { value: 'Category 1' } });
      fireEvent.change(statusSelect, { target: { value: 'low-stock' } });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(getInventoryReport).toHaveBeenCalledWith({
          category: 'Category 1',
          status: 'low-stock',
        });
      });
    });
  });

  describe('CustomerReport Page', () => {
    beforeEach(() => {
      getCustomerReport.mockResolvedValue(mockCustomerData);
      render(
        <BrowserRouter>
          <CustomerReport />
        </BrowserRouter>
      );
    });

    it('renders customer report with date range selector', () => {
      expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /generate report/i })).toBeInTheDocument();
    });

    it('displays customer summary data', async () => {
      await waitFor(() => {
        expect(screen.getByText(/total customers/i)).toBeInTheDocument();
        expect(screen.getByText(/new customers/i)).toBeInTheDocument();
        expect(screen.getByText(/active customers/i)).toBeInTheDocument();
        expect(screen.getByText(/customer lifetime value/i)).toBeInTheDocument();
      });
    });

    it('displays customer growth chart', async () => {
      await waitFor(() => {
        expect(screen.getByTestId('customer-chart')).toBeInTheDocument();
      });
    });

    it('displays top customers table', async () => {
      await waitFor(() => {
        expect(screen.getByText('Customer 1')).toBeInTheDocument();
        expect(screen.getByText('Customer 2')).toBeInTheDocument();
      });
    });

    it('handles date range selection', async () => {
      const startDateInput = screen.getByLabelText(/start date/i);
      const endDateInput = screen.getByLabelText(/end date/i);
      const generateButton = screen.getByRole('button', { name: /generate report/i });

      fireEvent.change(startDateInput, { target: { value: '2024-03-01' } });
      fireEvent.change(endDateInput, { target: { value: '2024-03-31' } });
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(getCustomerReport).toHaveBeenCalledWith('2024-03-01', '2024-03-31');
      });
    });

    it('handles report export', async () => {
      const exportButton = screen.getByRole('button', { name: /export/i });
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(exportReport).toHaveBeenCalledWith('customers', mockCustomerData);
      });
    });
  });
}); 