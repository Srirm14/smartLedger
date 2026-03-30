import '@testing-library/jest-dom';
import { afterEach, vi, beforeEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import React from 'react';

// Don't mock React hooks - use the actual implementation
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return actual;
});

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }) => <div>{children}</div>,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/', state: null }),
    Link: ({ children, to }) => <a href={to}>{children}</a>,
    Routes: ({ children }) => <div>{children}</div>,
    Route: ({ element }) => element,
  };
});

// Mock axios
const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: { use: vi.fn(), eject: vi.fn() },
    response: { use: vi.fn(), eject: vi.fn() }
  }
};

vi.mock('axios', () => ({
  default: {
    create: () => mockAxiosInstance,
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock AuthContext
vi.mock('@/store/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    user: null,
    loading: false,
    error: null,
    login: vi.fn(),
    register: vi.fn(),
    forgotPassword: vi.fn(),
    logout: vi.fn(),
  }),
}));

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Setup before each test
beforeEach(() => {
  vi.clearAllMocks();
}); 