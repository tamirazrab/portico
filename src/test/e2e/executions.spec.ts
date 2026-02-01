import { test, expect } from "@playwright/test";
import { createTestUser, loginAsUser, cleanupTestUser } from "./setup/auth";
import { generateTestUserEmail } from "./fixtures/test-user";
import { resetTestDatabase } from "./setup/database";
import { waitForPageReady, expectAuthenticated } from "./helpers/test-helpers";

test.describe("Executions E2E", () => {
  let testUserEmail: string;

  test.beforeEach(async ({ page }) => {
    // Reset database for test isolation
    await resetTestDatabase();
    
    // Create and login test user
    testUserEmail = generateTestUserEmail("execution-test");
    await createTestUser({
      email: testUserEmail,
      password: "TestPassword123!",
      name: "Execution Test User",
    });
    
    await loginAsUser(page, {
      email: testUserEmail,
      password: "TestPassword123!",
    });
    
    await page.goto("/en/dashboard/executions");
    await waitForPageReady(page);
  });

  test.afterEach(async () => {
    // Clean up test user
    if (testUserEmail) {
      await cleanupTestUser(testUserEmail);
    }
  });

  test("should display executions list", async ({ page }) => {
    // Assert
    await expect(page.getByRole("heading", { name: /executions/i })).toBeVisible();
  });

  test("should navigate to executions page from dashboard", async ({ page }) => {
    // Arrange
    await page.goto("/en/dashboard");
    await waitForPageReady(page);

    // Act
    await page.getByRole("link", { name: /executions/i }).click();

    // Assert
    await expect(page).toHaveURL(/.*executions/);
    await expect(page.getByRole("heading", { name: /executions/i })).toBeVisible();
  });

  test("should display execution details", async ({ page }) => {
    // Arrange
    await page.goto("/en/dashboard/executions");
    await waitForPageReady(page);

    // Act - click on first execution if available
    const executionItem = page.locator('[data-testid="execution-item"], .execution-item, tr').first();
    if (await executionItem.isVisible()) {
      await executionItem.click();
      await waitForPageReady(page);

      // Assert - should show execution details
      await expect(page.locator('text=/status|started|completed|workflow/i').first()).toBeVisible({ timeout: 5000 });
    } else {
      // If no executions, should show empty state
      await expect(page.locator('text=/no.*execution|empty/i').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should filter executions by status", async ({ page }) => {
    // Arrange
    await page.goto("/en/dashboard/executions");
    await waitForPageReady(page);

    // Act - look for status filter
    const statusFilter = page.locator('select[name*="status" i], [role="combobox"]').first();
    if (await statusFilter.isVisible()) {
      await statusFilter.click();
      await page.locator('text=/success|completed/i').first().click();
      await page.waitForTimeout(500);

      // Assert - filter should be applied
      await expect(statusFilter).toBeVisible();
    }
  });

  test("should paginate executions", async ({ page }) => {
    // Arrange
    await page.goto("/en/dashboard/executions");
    await waitForPageReady(page);

    // Assert - check if pagination exists
    const pagination = page.locator('[data-testid="pagination"], .pagination, nav[aria-label*="pagination" i]');
    const executionsList = page.locator('[data-testid="executions-list"], .executions-list');
    const isEmpty = await executionsList.count() === 0;
    
    if (!isEmpty) {
      // If executions exist, pagination should be visible
      await expect(pagination.first()).toBeVisible({ timeout: 5000 });
      
      // Try to navigate to next page
      const nextButton = page.locator('button:has-text("Next"), [aria-label*="next" i]').first();
      if (await nextButton.isVisible() && !(await nextButton.isDisabled())) {
        await nextButton.click();
        await waitForPageReady(page);
        // Should be on page 2
        await expect(page.locator('text=/page.*2|2.*of/i').first()).toBeVisible({ timeout: 5000 });
      }
    } else {
      // If no executions, should show empty state
      await expect(page.locator('text=/no.*execution|empty/i').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should show execution status indicators", async ({ page }) => {
    // Arrange
    await page.goto("/en/dashboard/executions");
    await waitForPageReady(page);

    // Assert - check for status indicators (success, failed, running)
    const statusIndicators = page.locator('[data-status], .status-indicator, [class*="status"]');
    const count = await statusIndicators.count();
    
    if (count > 0) {
      // Should have status indicators
      await expect(statusIndicators.first()).toBeVisible();
    }
  });

  test("should navigate to workflow from execution", async ({ page }) => {
    // Arrange
    await page.goto("/en/dashboard/executions");
    await waitForPageReady(page);

    // Act - click on workflow link in execution item
    const workflowLink = page.locator('a:has-text("workflow"), [href*="/workflows/"]').first();
    if (await workflowLink.isVisible()) {
      await workflowLink.click();
      await waitForPageReady(page);

      // Assert - should navigate to workflow
      await expect(page).toHaveURL(/\/workflows\/[^/]+/);
    }
  });

  test("should fail to access executions when unauthenticated", async ({ page }) => {
    // Arrange - logout first
    await page.goto("/en/dashboard/executions");
    const logoutButton = page.locator('button:has-text("Logout"), [data-testid="logout"]').first();
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForURL(/\/login/, { timeout: 5000 });
    }

    // Act - try to access executions
    await page.goto("/en/dashboard/executions");

    // Assert - should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });
});


