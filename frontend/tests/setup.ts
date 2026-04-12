/**
 * Jest Setup File for Frontend Tests
 * Runs before all tests to configure global test environment
 */

import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Suppress console errors during tests (optional)
global.console = {
  ...console,
  // Uncomment to suppress errors:
  // error: jest.fn(),
};

// Set test environment variables
process.env.VITE_API_URL = 'http://localhost:3000/api';
