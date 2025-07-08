import "@testing-library/jest-dom";

// Polyfill for TextEncoder/TextDecoder in Node.js environment
if (typeof global.TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Configuration pour supprimer les warnings act()
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes(
        "Warning: The current testing environment is not configured to support act(...)"
      )
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Configuration globale pour React Testing Library
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock pour IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock pour requestIdleCallback
global.requestIdleCallback = jest.fn().mockImplementation(callback => {
  return setTimeout(callback, 0);
});

global.cancelIdleCallback = jest.fn().mockImplementation(id => {
  clearTimeout(id);
});
