import "@testing-library/jest-dom";

// Polyfill for TextEncoder/TextDecoder in Node.js environment
if (typeof global.TextEncoder === "undefined") {
  const { TextEncoder, TextDecoder } = require("util");
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}
