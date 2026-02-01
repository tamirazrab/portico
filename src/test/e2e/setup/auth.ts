import { Page } from "@playwright/test";
import { getTestDatabase } from "./database";
import * as bcrypt from "bcrypt";

/**
 * Authentication helpers for E2E tests.
 * Provides real Better Auth flows without mocking.
 */

export interface TestUser {
  email: string;
  password: string;
  name?: string;
}

/**
 * Create a test user in the database.
 * This creates a real user that can be used for authentication testing.
 */
export async function createTestUser(user: TestUser): Promise<void> {
  const db = getTestDatabase();
  const hashedPassword = await bcrypt.hash(user.password, 10);
  
  // Create user in database
  // Note: This assumes Better Auth uses a user table
  // Adjust based on actual Better Auth schema
  await db.user.create({
    data: {
      email: user.email,
      password: hashedPassword,
      name: user.name || user.email.split("@")[0],
      emailVerified: new Date(),
    },
  });
}

/**
 * Login as a test user using real Better Auth flow.
 * This performs actual authentication, not mocking.
 */
export async function loginAsUser(
  page: Page,
  user: TestUser,
): Promise<void> {
  await page.goto("/en/login");
  
  // Fill login form
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  
  // Submit form
  await page.click('button[type="submit"]');
  
  // Wait for navigation to dashboard
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}

/**
 * Logout current user.
 */
export async function logout(page: Page): Promise<void> {
  // Find and click logout button
  // Adjust selector based on actual UI
  await page.click('button:has-text("Logout")');
  await page.waitForURL(/\/login/, { timeout: 5000 });
}

/**
 * Get authenticated page context.
 * Returns a page that is already logged in as the specified user.
 */
export async function getAuthenticatedPage(
  page: Page,
  user: TestUser,
): Promise<Page> {
  await loginAsUser(page, user);
  return page;
}

/**
 * Clean up test users.
 * Removes test users created during tests.
 */
export async function cleanupTestUser(email: string): Promise<void> {
  const db = getTestDatabase();
  await db.user.deleteMany({
    where: { email },
  });
}

