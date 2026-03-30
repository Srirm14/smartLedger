import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StaffList from '@/pages/Staff/StaffList';
import StaffDetails from '@/pages/Staff/StaffDetails';
import StaffForm from '@/pages/Staff/StaffForm';

// Mock the staff service
vi.mock('@/services/staff', () => ({
  getStaffMembers: vi.fn(),
  getStaffMemberById: vi.fn(),
  createStaffMember: vi.fn(),
  updateStaffMember: vi.fn(),
  deleteStaffMember: vi.fn(),
  updateStaffRole: vi.fn(),
}));

// Mock data
const mockStaffMembers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Manager',
    department: 'Sales',
    joinDate: '2024-01-01',
    status: 'Active',
    phone: '1234567890',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Sales Representative',
    department: 'Sales',
    joinDate: '2024-02-01',
    status: 'Active',
    phone: '0987654321',
  },
];

describe('Staff Pages', () => {
  describe('StaffList Page', () => {
    beforeEach(() => {
      getStaffMembers.mockResolvedValue(mockStaffMembers);
      render(
        <BrowserRouter>
          <StaffList />
        </BrowserRouter>
      );
    });

    it('renders staff list with search and add button', () => {
      expect(screen.getByPlaceholderText(/search staff/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add staff/i })).toBeInTheDocument();
    });

    it('displays list of staff members', async () => {
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Manager')).toBeInTheDocument();
        expect(screen.getByText('Sales Representative')).toBeInTheDocument();
      });
    });

    it('filters staff members based on search input', async () => {
      const searchInput = screen.getByPlaceholderText(/search staff/i);
      fireEvent.change(searchInput, { target: { value: 'John' } });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });

    it('filters staff members by department', async () => {
      const departmentSelect = screen.getByLabelText(/department/i);
      fireEvent.change(departmentSelect, { target: { value: 'Sales' } });

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });
  });

  describe('StaffDetails Page', () => {
    const mockStaffMember = mockStaffMembers[0];

    beforeEach(() => {
      getStaffMemberById.mockResolvedValue(mockStaffMember);
      render(
        <BrowserRouter>
          <StaffDetails />
        </BrowserRouter>
      );
    });

    it('displays staff member details', async () => {
      await waitFor(() => {
        expect(screen.getByText(mockStaffMember.name)).toBeInTheDocument();
        expect(screen.getByText(mockStaffMember.email)).toBeInTheDocument();
        expect(screen.getByText(mockStaffMember.role)).toBeInTheDocument();
        expect(screen.getByText(mockStaffMember.department)).toBeInTheDocument();
        expect(screen.getByText(mockStaffMember.phone)).toBeInTheDocument();
      });
    });

    it('handles role update', async () => {
      const roleSelect = screen.getByLabelText(/role/i);
      const updateButton = screen.getByRole('button', { name: /update role/i });

      fireEvent.change(roleSelect, { target: { value: 'Senior Manager' } });
      fireEvent.click(updateButton);

      await waitFor(() => {
        expect(updateStaffRole).toHaveBeenCalledWith(mockStaffMember.id, 'Senior Manager');
      });
    });

    it('handles edit button click', async () => {
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(window.location.pathname).toBe(`/staff/${mockStaffMember.id}/edit`);
      });
    });

    it('handles delete confirmation', async () => {
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(deleteStaffMember).toHaveBeenCalledWith(mockStaffMember.id);
      });
    });
  });

  describe('StaffForm Page', () => {
    beforeEach(() => {
      render(
        <BrowserRouter>
          <StaffForm />
        </BrowserRouter>
      );
    });

    it('renders staff form with all required fields', () => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    });

    it('shows validation errors for empty required fields', async () => {
      const saveButton = screen.getByRole('button', { name: /save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/role is required/i)).toBeInTheDocument();
        expect(screen.getByText(/department is required/i)).toBeInTheDocument();
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

    it('validates phone number format', async () => {
      const phoneInput = screen.getByLabelText(/phone/i);
      const saveButton = screen.getByRole('button', { name: /save/i });

      fireEvent.change(phoneInput, { target: { value: '123' } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid phone number format/i)).toBeInTheDocument();
      });
    });

    it('handles successful form submission', async () => {
      const nameInput = screen.getByLabelText(/name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const roleInput = screen.getByLabelText(/role/i);
      const departmentInput = screen.getByLabelText(/department/i);
      const phoneInput = screen.getByLabelText(/phone/i);
      const saveButton = screen.getByRole('button', { name: /save/i });

      fireEvent.change(nameInput, { target: { value: 'New Staff' } });
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
      fireEvent.change(roleInput, { target: { value: 'Sales Representative' } });
      fireEvent.change(departmentInput, { target: { value: 'Sales' } });
      fireEvent.change(phoneInput, { target: { value: '1234567890' } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(createStaffMember).toHaveBeenCalledWith({
          name: 'New Staff',
          email: 'new@example.com',
          role: 'Sales Representative',
          department: 'Sales',
          phone: '1234567890',
        });
      });
    });
  });
}); 