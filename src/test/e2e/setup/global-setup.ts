import { chromium, FullConfig } from "@playwright/test";
import { resetTestDatabase, seedTestDatabase } from "./database";

/**
 * Global setup for E2E tests.
 * Runs before all tests to:
 * - Reset test database
 * - Seed test database with required data
 * - Verify test environment is ready
 */
async function globalSetup(config: FullConfig) {
  console.log("Setting up E2E test environment...");
  
  // Reset test database to ensure clean state
  await resetTestDatabase();
  console.log("Test database reset complete");
  
  // Seed test database with required data
  await seedTestDatabase();
  console.log("Test database seeded");
  
  // Verify test database connection
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto(config.projects[0].use.baseURL || "http://localhost:3000");
    console.log("Test server is accessible");
  } catch (error) {
    console.error("Failed to connect to test server:", error);
    throw error;
  } finally {
    await browser.close();
  }
  
  console.log("E2E test environment setup complete");
}

export default globalSetup;

