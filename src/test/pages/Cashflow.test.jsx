import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CashflowList, CashflowDetails, CashflowForm } from '@/test/mocks/components/Cashflow';

// Mock the cashflow service
vi.mock('@/services/cashflow', () => ({
  getCashflowEntries: vi.fn(),
  getCashflowEntryById: vi.fn(),
  createCashflowEntry: vi.fn(),
  updateCashflowEntry: vi.fn(),
  deleteCashflowEntry: vi.fn(),
  getCashflowSummary: vi.fn(),
}));

// Mock data
const mockCashflowEntries = [
  {
    id: '1',
    type: 'income',
    amount: 5000,
    description: 'Sales Revenue',
    date: '2024-03-01',
    category: 'Sales',
    paymentMethod: 'Bank Transfer',
    status: 'Completed',
  },
  {
    id: '2',
    type: 'expense',
    amount: 2000,
    description: 'Office Supplies',
    date: '2024-03-02',
    category: 'Operations',
    paymentMethod: 'Credit Card',
    status: 'Pending',
  },
];

const mockCashflowSummary = {
  totalIncome: 10000,
  totalExpenses: 5000,
  netCashflow: 5000,
  incomeByCategory: [
    { category: 'Sales', amount: 8000 },
    { category: 'Services', amount: 2000 },
  ],
  expensesByCategory: [
    { category: 'Operations', amount: 3000 },
    { category: 'Marketing', amount: 2000 },
  ],
};

describe('Cashflow Pages', () => {
  describe('CashflowList Page', () => {
    beforeEach(() => {
      render(<CashflowList />);
    });

    it('renders cashflow list with filters and add button', () => {
      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date range/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add entry/i })).toBeInTheDocument();
    });

    it('displays list of cashflow entries', () => {
      expect(screen.getByText('Sales Revenue')).toBeInTheDocument();
      expect(screen.getByText('Office Supplies')).toBeInTheDocument();
      expect(screen.getByText('$5,000.00')).toBeInTheDocument();
      expect(screen.getByText('$2,000.00')).toBeInTheDocument();
    });

    it('displays cashflow summary', () => {
      expect(screen.getByText(/Total Income/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Expenses/i)).toBeInTheDocument();
      expect(screen.getByText(/Net Cashflow/i)).toBeInTheDocument();
    });

    it('has filter controls for type', () => {
      const typeSelect = screen.getByLabelText(/type/i);
      expect(typeSelect).toBeInTheDocument();
    });

    it('has date range filters', () => {
      const startDateInput = screen.getByLabelText('Start Date');
      const endDateInput = screen.getByLabelText('End Date');
      const filterButton = screen.getByRole('button', { name: /apply filters/i });
      
      expect(startDateInput).toBeInTheDocument();
      expect(endDateInput).toBeInTheDocument();
      expect(filterButton).toBeInTheDocument();
    });
  });

  describe('CashflowDetails Page', () => {
    const mockEntry = mockCashflowEntries[0];

    beforeEach(() => {
      render(<CashflowDetails />);
    });

    it('displays cashflow entry details', () => {
      expect(screen.getByText(/Description: Sales Revenue/i)).toBeInTheDocument();
      expect(screen.getByText(/Amount: \$5000.00/i)).toBeInTheDocument();
      expect(screen.getByText(/Category: Sales/i)).toBeInTheDocument();
      expect(screen.getByText(/Payment Method: Bank Transfer/i)).toBeInTheDocument();
      expect(screen.getByText(/Status: Completed/i)).toBeInTheDocument();
    });

    it('has edit and delete buttons', () => {
      const editButton = screen.getByRole('button', { name: /edit/i });
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      
      expect(editButton).toBeInTheDocument();
      expect(deleteButton).toBeInTheDocument();
    });

    it('has a confirmation button', () => {
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      expect(confirmButton).toBeInTheDocument();
    });
  });

  describe('CashflowForm Page', () => {
    beforeEach(() => {
      render(<CashflowForm />);
    });

    it('renders cashflow form with all required fields', () => {
      expect(screen.getByLabelText(/type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/payment method/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('shows validation errors for empty required fields', () => {
      expect(screen.getByText(/type is required/i)).toBeInTheDocument();
      expect(screen.getByText(/amount is required/i)).toBeInTheDocument();
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
      expect(screen.getByText(/date is required/i)).toBeInTheDocument();
      expect(screen.getByText(/category is required/i)).toBeInTheDocument();
    });

    it('validates amount is positive', () => {
      expect(screen.getByText(/amount must be positive/i)).toBeInTheDocument();
    });

    it('has all form fields for submission', () => {
      const typeInput = screen.getByLabelText(/type/i);
      const amountInput = screen.getByLabelText(/amount/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const dateInput = screen.getByLabelText(/date/i);
      const categoryInput = screen.getByLabelText(/category/i);
      const paymentMethodInput = screen.getByLabelText(/payment method/i);
      const saveButton = screen.getByRole('button', { name: /save/i });

      expect(typeInput).toBeInTheDocument();
      expect(amountInput).toBeInTheDocument();
      expect(descriptionInput).toBeInTheDocument();
      expect(dateInput).toBeInTheDocument();
      expect(categoryInput).toBeInTheDocument();
      expect(paymentMethodInput).toBeInTheDocument();
      expect(saveButton).toBeInTheDocument();
    });
  });
}); 