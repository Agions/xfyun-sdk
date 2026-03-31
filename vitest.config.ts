import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: [
      'tests/**/*.{test,spec}.{ts,tsx}',
      'tests/e2e/**/*.{test,spec}.{ts,tsx}',
      'tests/performance/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: [
      'tests/e2e/**', // E2E tests need special setup
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', '!src/**/*.d.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/types.ts',
        'src/index.ts',
      ],
    },
  },
});

// E2E and Performance test configurations
export const e2eConfig = defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/e2e/**/*.{test,spec}.{ts,tsx}'],
    testTimeout: 30000,
  },
});

export const performanceConfig = defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/performance/**/*.{test,spec}.{ts,tsx}'],
    testTimeout: 30000,
  },
});
