import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/atoms/**/*.ts', 'src/molecules/**/*.ts', 'src/app/router.ts', 'src/content/**/*.ts'],
      exclude: ['**/*.test.ts', '**/memory/**', '**/qaSessionTypes.ts'],
      thresholds: {
        lines: 90,
        functions: 90,
        statements: 90,
        branches: 85,
      },
    },
  },
});
