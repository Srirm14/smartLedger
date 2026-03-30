import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProductDetails from '@/test/mocks/components/ProductDetails';

describe('ProductDetails', () => {
  beforeEach(() => {
    render(<ProductDetails />);
  });

  it('renders product details correctly', () => {
    // Check if the main elements are rendered
    expect(screen.getByText('Product Details')).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Category: Test Category')).toBeInTheDocument();
    expect(screen.getByText('UOM: Test UOM')).toBeInTheDocument();
  });

  it('shows correct initial status', () => {
    expect(screen.getByText('Status: Active')).toBeInTheDocument();
  });

  it('has a save button for changes', () => {
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
  });
}); 