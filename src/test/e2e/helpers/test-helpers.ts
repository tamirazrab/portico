import { Page, expect } from "@playwright/test";

/**
 * Test helpers for E2E tests.
 * Provides common utilities and assertions.
 */

/**
 * Wait for page to be fully loaded and ready.
 */
export async function waitForPageReady(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");
  await page.waitForLoadState("domcontentloaded");
}

/**
 * Assert that user is authenticated (on dashboard).
 */
export async function expectAuthenticated(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/dashboard/);
}

/**
 * Assert that user is not authenticated (redirected to login).
 */
export async function expectUnauthenticated(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/login/);
}

/**
 * Wait for element to be visible with retry.
 */
export async function waitForVisible(
  page: Page,
  selector: string,
  timeout: number = 10000,
): Promise<void> {
  await page.waitForSelector(selector, { state: "visible", timeout });
}

/**
 * Fill form field and wait for it to be filled.
 */
export async function fillField(
  page: Page,
  selector: string,
  value: string,
): Promise<void> {
  await page.fill(selector, value);
  await expect(page.locator(selector)).toHaveValue(value);
}

/**
 * Click button and wait for navigation or action to complete.
 */
export async function clickAndWait(
  page: Page,
  selector: string,
  waitForNavigation: boolean = true,
): Promise<void> {
  if (waitForNavigation) {
    await Promise.all([
      page.waitForNavigation({ waitUntil: "networkidle" }),
      page.click(selector),
    ]);
  } else {
    await page.click(selector);
    await page.waitForTimeout(500); // Small delay for actions to complete
  }
}

/**
 * Assert toast message appears.
 */
export async function expectToast(
  page: Page,
  message: string | RegExp,
): Promise<void> {
  const toast = page.locator('[role="status"], [data-sonner-toast]');
  await expect(toast.filter({ hasText: message })).toBeVisible({ timeout: 5000 });
}

/**
 * Assert error message appears.
 */
export async function expectError(
  page: Page,
  message: string | RegExp,
): Promise<void> {
  const errorElement = page.locator('text=/error|Error|failed|Failed/i').filter({ hasText: message });
  await expect(errorElement.first()).toBeVisible({ timeout: 5000 });
}

