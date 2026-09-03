import { defineConfig, devices } from '@playwright/test'

process.env.VITE_API_BASE_URL = 'http://localhost:3000'

export default defineConfig({
  testDir: './e2e',
  timeout: 120_000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  globalSetup: './e2e/integration/global-setup.ts',
  globalTeardown: './e2e/integration/global-teardown.ts',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm exec vite -- --mode e2e',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
