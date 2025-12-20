import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E tests
 */
export default defineConfig({
  testDir: '../tests',  // Tests are in root /tests folder
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Use existing dev servers (backend on :3001, frontend on :5173)
  // Start them manually before running tests:
  // Terminal 1: cd backend && npm run dev
  // Terminal 2: cd frontend && npm run dev
  // Terminal 3: cd frontend && npx playwright test
});
