/** @type {import('jest').Config} */
/* eslint-env node */
/* global module */

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/coverage/", "/dist/", "/build/"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        useESM: false,
        isolatedModules: true,
        compilerOptions: {
          module: "commonjs",
          target: "es2017",
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          skipLibCheck: true,
          noEmit: true,
          moduleResolution: "node",
        },
      },
    ],
  },
  moduleFileExtensions: ["ts", "js", "json", "node"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
  collectCoverage: true,
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: ["/node_modules/", "/__tests__/", "/dist/"],
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      statements: 20,
      branches: 20,
      functions: 20,
      lines: 20,
    },
  },
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
  testTimeout: 30000,
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/index.ts",
    "!src/server.ts",
  ],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
      useESM: false,
      compilerOptions: {
        module: "commonjs",
        target: "es2017",
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        skipLibCheck: true,
        noEmit: true,
        moduleResolution: "node",
      },
    },
  },
  transformIgnorePatterns: ["node_modules/(?!(stripe|@stripe)/)"],
  extensionsToTreatAsEsm: [],
  moduleDirectories: ["node_modules", "src"],
  testEnvironmentOptions: {
    url: "http://localhost",
  },
};
