import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.jsx'],
    include: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/setup.jsx',
        'src/test/utils.jsx',
        'src/test/mocks/**',
      ],
    },
    server: {
      deps: {
        inline: ['react-router-dom'],
      }
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/pages/Auth': path.resolve(__dirname, './src/test/mocks/pages/Auth.jsx'),
      '@/pages/Product/ProductList': path.resolve(__dirname, './src/test/mocks/pages/Product.jsx'),
      '@/pages/Customer/CustomerList': path.resolve(__dirname, './src/test/mocks/pages/Customer.jsx'),
      '@/pages/Staff/StaffList': path.resolve(__dirname, './src/test/mocks/pages/Staff.jsx'),
      '@/pages/Inventory/InventoryList': path.resolve(__dirname, './src/test/mocks/pages/Inventory.jsx'),
      '@/pages/Cashflow/CashflowList': path.resolve(__dirname, './src/test/mocks/pages/Cashflow.jsx'),
      '@/pages/Reports/SalesReport': path.resolve(__dirname, './src/test/mocks/pages/Reports.jsx'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
}); 