import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  // Visual baselines differ across host OS/fonts (WSL vs ubuntu-latest).
  // Capture/update them on the same runner CI uses before enabling in CI.
  testIgnore: process.env.CI ? [/visual-regression\.spec\.ts/] : [],
  // Maximum time one test can run
  timeout: 30 * 1000,
  // Run tests in files in parallel
  fullyParallel: true,
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  // Reporter to use
  reporter: [['html', { outputFolder: 'tests/e2e-report' }], ['list']],
  // Shared settings for all the projects below
  use: {
    // Base URL for page.goto('/')
    baseURL: 'http://localhost:8080',
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    // Screenshot on failure
    screenshot: 'only-on-failure',
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],

  // Run local dev server before starting tests
  webServer: {
    command: 'npx serve -p 8080',
    port: 8080,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});
