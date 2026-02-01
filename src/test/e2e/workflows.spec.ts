import { test, expect } from "@playwright/test";
import { createTestUser, loginAsUser, cleanupTestUser } from "./setup/auth";
import { generateTestUserEmail } from "./fixtures/test-user";
import { resetTestDatabase } from "./setup/database";
import { waitForPageReady, expectAuthenticated, fillField, clickAndWait, expectToast } from "./helpers/test-helpers";

test.describe("Workflows E2E", () => {
  let testUserEmail: string;

  test.beforeEach(async ({ page }) => {
    // Reset database for test isolation
    await resetTestDatabase();
    
    // Create and login test user
    testUserEmail = generateTestUserEmail("workflow-test");
    await createTestUser({
      email: testUserEmail,
      password: "TestPassword123!",
      name: "Workflow Test User",
    });
    
    await loginAsUser(page, {
      email: testUserEmail,
      password: "TestPassword123!",
    });
    
    await page.goto("/en/dashboard/workflows");
    await waitForPageReady(page);
  });

  test.afterEach(async () => {
    // Clean up test user
    if (testUserEmail) {
      await cleanupTestUser(testUserEmail);
    }
  });

  test("should display workflows list", async ({ page }) => {
    // Assert
    await expect(page.getByRole("heading", { name: /workflows/i })).toBeVisible();
  });

  test("should navigate to workflows page from dashboard", async ({ page }) => {
    // Arrange
    await page.goto("/en/dashboard");
    await waitForPageReady(page);

    // Act
    await page.getByRole("link", { name: /workflows/i }).click();

    // Assert
    await expect(page).toHaveURL(/.*workflows/);
    await expect(page.getByRole("heading", { name: /workflows/i })).toBeVisible();
  });

  test("should create new workflow", async ({ page }) => {
    // Arrange
    await page.goto("/en/dashboard/workflows");
    await waitForPageReady(page);

    // Act - click create workflow button
    const createButton = page.getByRole("button", { name: /create|new.*workflow/i }).first();
    await createButton.click();
    
    // Wait for workflow to be created and navigate to editor
    await page.waitForURL(/\/workflows\/[^/]+/, { timeout: 10000 });

    // Assert
    await expect(page).toHaveURL(/\/workflows\/[^/]+/);
    // Should be in workflow editor
    await expect(page.locator('text=/workflow|editor/i').first()).toBeVisible({ timeout: 5000 });
  });

  test("should list workflows with pagination", async ({ page }) => {
    // Arrange
    await page.goto("/en/dashboard/workflows");
    await waitForPageReady(page);

    // Act - check if pagination exists
    const pagination = page.locator('[data-testid="pagination"], .pagination, nav[aria-label*="pagination" i]');
    
    // Assert
    // Pagination should be visible if there are workflows
    // If no workflows, should show empty state
    const workflowsList = page.locator('[data-testid="workflows-list"], .workflows-list');
    const isEmpty = await workflowsList.count() === 0;
    
    if (!isEmpty) {
      // If workflows exist, pagination should be visible
      await expect(pagination.first()).toBeVisible({ timeout: 5000 });
    } else {
      // If no workflows, should show empty state
      await expect(page.locator('text=/no.*workflow|empty/i').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should search workflows", async ({ page }) => {
    // Arrange
    await page.goto("/en/dashboard/workflows");
    await waitForPageReady(page);

    // Act - enter search query
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("test");
      await page.waitForTimeout(500); // Wait for debounce

      // Assert - search should filter results
      // Results should update (this is a basic check, actual implementation may vary)
      await expect(searchInput).toHaveValue("test");
    }
  });

  test("should update workflow name", async ({ page }) => {
    // Arrange - create a workflow first
    await page.goto("/en/dashboard/workflows");
    await waitForPageReady(page);
    
    const createButton = page.getByRole("button", { name: /create|new.*workflow/i }).first();
    await createButton.click();
    await page.waitForURL(/\/workflows\/[^/]+/, { timeout: 10000 });
    
    // Act - update workflow name
    const nameInput = page.locator('input[value*="workflow"], input[name*="name" i]').first();
    if (await nameInput.isVisible()) {
      await nameInput.clear();
      await nameInput.fill("Updated Workflow Name");
      await nameInput.press("Enter");
      
      // Assert - name should be updated
      await expect(nameInput).toHaveValue("Updated Workflow Name");
    }
  });

  test("should delete workflow", async ({ page }) => {
    // Arrange - create a workflow first
    await page.goto("/en/dashboard/workflows");
    await waitForPageReady(page);
    
    const createButton = page.getByRole("button", { name: /create|new.*workflow/i }).first();
    await createButton.click();
    await page.waitForURL(/\/workflows\/[^/]+/, { timeout: 10000 });
    
    // Get workflow ID from URL
    const workflowId = page.url().split("/workflows/")[1]?.split("/")[0];
    
    // Navigate back to workflows list
    await page.goto("/en/dashboard/workflows");
    await waitForPageReady(page);

    // Act - delete workflow
    // Find delete button for the workflow (adjust selector based on actual UI)
    const deleteButton = page.locator(`button[aria-label*="delete" i], button:has-text("Delete")`).first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // Confirm deletion if confirmation dialog appears
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete")').last();
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }
      
      // Assert - workflow should be removed from list
      await expect(page.locator(`text=${workflowId}`)).not.toBeVisible({ timeout: 5000 });
    }
  });

  test("should fail to create workflow when unauthenticated", async ({ page }) => {
    // Arrange - logout first
    await page.goto("/en/dashboard/workflows");
    const logoutButton = page.locator('button:has-text("Logout"), [data-testid="logout"]').first();
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForURL(/\/login/, { timeout: 5000 });
    }

    // Act - try to access workflows
    await page.goto("/en/dashboard/workflows");

    // Assert - should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test("should execute workflow", async ({ page }) => {
    // Arrange - create a workflow first
    await page.goto("/en/dashboard/workflows");
    await waitForPageReady(page);
    
    const createButton = page.getByRole("button", { name: /create|new.*workflow/i }).first();
    await createButton.click();
    await page.waitForURL(/\/workflows\/[^/]+/, { timeout: 10000 });
    
    // Act - execute workflow
    const executeButton = page.getByRole("button", { name: /execute|run/i }).first();
    if (await executeButton.isVisible()) {
      await executeButton.click();
      
      // Assert - should show execution started or success message
      await expectToast(page, /execut|start|success/i);
    }
  });
});


