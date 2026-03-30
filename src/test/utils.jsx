import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

// Create a simple wrapper that doesn't use any real React components or hooks
const TestWrapper = ({ children }) => {
  return <div data-testid="test-wrapper">{children}</div>;
};

export const renderWithProviders = (component) => {
  return render(component, { wrapper: TestWrapper });
};

export const mockAuthContext = {
  user: null,
  loading: false,
  error: null,
  login: vi.fn(),
  register: vi.fn(),
  forgotPassword: vi.fn(),
  logout: vi.fn(),
};

export const mockProduct = {
  id: 1,
  product: 'Test Product',
  category: 'Test Category',
  uom: 'Test UOM',
  createdAt: '2024-03-20',
  discontinued: false,
};

export const mockCustomer = {
  id: 1,
  name: 'Test Customer',
  email: 'test@example.com',
  phone: '1234567890',
  address: 'Test Address',
};

export const mockStaff = {
  id: 1,
  name: 'Test Staff',
  email: 'staff@example.com',
  role: 'Manager',
  status: 'Active',
};

export const mockInventory = {
  id: 1,
  product: 'Test Product',
  quantity: 100,
  location: 'Warehouse A',
  lastUpdated: '2024-03-20',
};

export const mockCashflow = {
  id: 1,
  type: 'Income',
  amount: 1000,
  description: 'Test Transaction',
  date: '2024-03-20',
}; 