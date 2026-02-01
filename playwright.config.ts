import { defineConfig, devices } from "@playwright/test";

/**
 * E2E Test Configuration
 * 
 * Tests run against:
 * - Real test database (isolated, resettable)
 * - Real API routes (no mocking)
 * - Real authentication flows (Better Auth)
 * - Real network requests
 * 
 * Test database is configured via TEST_DATABASE_URL environment variable.
 * Default: postgresql://test_user:test_password@localhost:5433/portico_test
 */
export default defineConfig({
  testDir: "./src/test/e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000",
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
    /* Screenshot on failure */
    screenshot: "only-on-failure",
    /* Video on failure */
    video: "retain-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: {
      // Use test database for E2E tests
      DATABASE_URL: process.env.TEST_DATABASE_URL ||
        "postgresql://test_user:test_password@localhost:5433/portico_test",
    },
  },

  /* Global setup and teardown */
  globalSetup: require.resolve("./src/test/e2e/setup/global-setup.ts"),
  globalTeardown: require.resolve("./src/test/e2e/setup/global-teardown.ts"),
});

