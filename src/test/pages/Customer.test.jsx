import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CustomerList from '@/pages/Customer/CustomerList';
import CustomerDetails from '@/pages/Customer/CustomerDetails';
import CustomerForm from '@/pages/Customer/CustomerForm';

// Mock the customer service
vi.mock('@/services/customer', () => ({
  getCustomers: vi.fn(),
  getCustomerById: vi.fn(),
  createCustomer: vi.fn(),
  updateCustomer: vi.fn(),
  deleteCustomer: vi.fn(),
}));

// Mock data
const mockCustomers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    address: '123 Main St',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '0987654321',
    address: '456 Oak St',
  },
];

describe('Customer Pages', () => {
  describe('CustomerList Page', () => {
    beforeEach(() => {
      getCustomers.mockResolvedValue(mockCustomers);
      render(
        <BrowserRouter>
          <CustomerList />
        </BrowserRouter>
      );
    });

    it('renders customer list with search and add button', () => {
      expect(screen.getByPlaceholderText(/search customers/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add customer/i })).toBeInTheDocument();
    });

    it('displays list of customers', async () => {
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('filters customers based on search input', async () => {
      const searchInput = screen.getByPlaceholderText(/search customers/i);
      fireEvent.change(searchInput, { target: { value: 'John' } });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });
  });

  describe('CustomerDetails Page', () => {
    const mockCustomer = mockCustomers[0];

    beforeEach(() => {
      getCustomerById.mockResolvedValue(mockCustomer);
      render(
        <BrowserRouter>
          <CustomerDetails />
        </BrowserRouter>
      );
    });

    it('displays customer details', async () => {
      await waitFor(() => {
        expect(screen.getByText(mockCustomer.name)).toBeInTheDocument();
        expect(screen.getByText(mockCustomer.email)).toBeInTheDocument();
        expect(screen.getByText(mockCustomer.phone)).toBeInTheDocument();
        expect(screen.getByText(mockCustomer.address)).toBeInTheDocument();
      });
    });

    it('handles edit button click', async () => {
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(window.location.pathname).toBe(`/customers/${mockCustomer.id}/edit`);
      });
    });

    it('handles delete confirmation', async () => {
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(deleteCustomer).toHaveBeenCalledWith(mockCustomer.id);
      });
    });
  });

  describe('CustomerForm Page', () => {
    beforeEach(() => {
      render(
        <BrowserRouter>
          <CustomerForm />
        </BrowserRouter>
      );
    });

    it('renders customer form with all required fields', () => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('shows validation errors for empty required fields', async () => {
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('validates email format', async () => {
      const emailInput = screen.getByLabelText(/email/i);
      const saveButton = screen.getByRole('button', { name: /save/i });

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
    });

    it('handles successful form submission', async () => {
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const phoneInput = screen.getByLabelText(/phone/i);
      const addressInput = screen.getByLabelText(/address/i);
      const saveButton = screen.getByRole('button', { name: /save/i });

      fireEvent.change(nameInput, { target: { value: 'New Customer' } });
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
      fireEvent.change(phoneInput, { target: { value: '1234567890' } });
      fireEvent.change(addressInput, { target: { value: '789 New St' } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(createCustomer).toHaveBeenCalledWith({
          name: 'New Customer',
          email: 'new@example.com',
          phone: '1234567890',
          address: '789 New St',
        });
      });
    });
  });
}); 