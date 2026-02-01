import { TestUser } from "../setup/auth";

/**
 * Test user fixtures for E2E tests.
 * Provides predefined test users for different scenarios.
 */

export const TEST_USERS = {
  /**
   * Standard test user with premium access.
   */
  premium: {
    email: "test-premium@example.com",
    password: "TestPassword123!",
    name: "Test Premium User",
  } as TestUser,

  /**
   * Standard test user with basic access.
   */
  basic: {
    email: "test-basic@example.com",
    password: "TestPassword123!",
    name: "Test Basic User",
  } as TestUser,

  /**
   * Admin test user.
   */
  admin: {
    email: "test-admin@example.com",
    password: "TestPassword123!",
    name: "Test Admin User",
  } as TestUser,
} as const;

/**
 * Generate a unique test user email.
 * Useful for tests that need isolated user state.
 */
export function generateTestUserEmail(prefix: string = "test"): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}@example.com`;
}

