import { FullConfig } from "@playwright/test";
import { closeTestDatabase } from "./database";

/**
 * Global teardown for E2E tests.
 * Runs after all tests to clean up resources.
 */
async function globalTeardown(config: FullConfig) {
  console.log("Tearing down E2E test environment...");
  
  // Close test database connection
  await closeTestDatabase();
  console.log("Test database connection closed");
  
  console.log("E2E test environment teardown complete");
}

export default globalTeardown;

