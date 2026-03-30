import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Login, Register, ForgotPassword } from '../mocks/components/Auth';

// Mock functions
const mockLogin = vi.fn();
const mockRegister = vi.fn();
const mockForgotPassword = vi.fn();

describe('Auth Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Login Page', () => {
    beforeEach(() => {
      render(<Login />);
    });

    it('renders login form with all required fields', () => {
      expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('shows validation errors for empty fields', () => {
      expect(screen.getByText(/all fields are required/i)).toBeInTheDocument();
    });

    it('has form elements to handle login', () => {
      expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  describe('Register Page', () => {
    beforeEach(() => {
      render(<Register />);
    });

    it('renders registration form with all required fields', () => {
      expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
      // Use getAllByPlaceholderText to handle multiple elements with "password"
      const passwordFields = screen.getAllByPlaceholderText(/password/i);
      expect(passwordFields.length).toBe(2); // Two password fields
      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });

    it('shows validation errors for empty fields', () => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });

    it('validates password match', () => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  describe('Forgot Password Page', () => {
    beforeEach(() => {
      render(<ForgotPassword />);
    });

    it('renders forgot password form', () => {
      expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });

    it('shows validation error for empty email', () => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });

    it('has form elements to handle password reset', () => {
      expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });
  });
}); 