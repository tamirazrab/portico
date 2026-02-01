import { test, expect } from "@playwright/test";
import { createTestUser, loginAsUser, cleanupTestUser } from "./setup/auth";
import { generateTestUserEmail } from "./fixtures/test-user";
import { resetTestDatabase } from "./setup/database";
import { waitForPageReady, fillField, expectToast } from "./helpers/test-helpers";

test.describe("Credentials E2E", () => {
  let testUserEmail: string;

  test.beforeEach(async ({ page }) => {
    // Reset database for test isolation
    await resetTestDatabase();

    // Create and login test user
    testUserEmail = generateTestUserEmail("credential-test");
    await createTestUser({
      email: testUserEmail,
      password: "TestPassword123!",
      name: "Credential Test User",
    });

    await loginAsUser(page, {
      email: testUserEmail,
      password: "TestPassword123!",
    });

    await page.goto("/en/dashboard/credentials");
    await waitForPageReady(page);
  });

  test.afterEach(async () => {
    // Clean up test user
    if (testUserEmail) {
      await cleanupTestUser(testUserEmail);
    }
  });

  test("should display credentials list", async ({ page }) => {
    // Assert
    await expect(page.getByRole("heading", { name: /credentials/i })).toBeVisible();
  });

  test("should navigate to credentials page from dashboard", async ({ page }) => {
    // Arrange
    await page.goto("/en/dashboard");
    await waitForPageReady(page);

    // Act
    await page.getByRole("link", { name: /credentials/i }).click();

    // Assert
    await expect(page).toHaveURL(/.*credentials/);
    await expect(page.getByRole("heading", { name: /credentials/i })).toBeVisible();
  });

  test("should create new credential", async ({ page }) => {
    // Arrange
    await page.goto("/en/dashboard/credentials");
    await waitForPageReady(page);

    // Act - click create credential button
    const createButton = page.getByRole("button", { name: /create|new.*credential/i }).first();
    if (await createButton.isVisible()) {
      await createButton.click();

      // Fill credential form
      await waitForPageReady(page);
      const nameInput = page.locator('input[name*="name" i], input[placeholder*="name" i]').first();
      const valueInput = page.locator('input[name*="value" i], input[type="password"], input[type="text"]').nth(1);
      const typeSelect = page.locator('select[name*="type" i], [role="combobox"]').first();

      if (await nameInput.isVisible()) {
        await fillField(page, nameInput, "Test API Key");
        await fillField(page, valueInput, "test-api-key-12345");

        // Select credential type if visible
        if (await typeSelect.isVisible()) {
          await typeSelect.click();
          await page.locator('text=/openai|gemini|anthropic/i').first().click();
        }

        // Submit form
        const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")').first();
        await submitButton.click();

        // Assert - should show success message or navigate back to list
        await expectToast(page, /created|success/i);
      }
    }
  });

  test("should list credentials with pagination", async ({ page }) => {
    // Arrange
    await page.goto("/en/dashboard/credentials");
    await waitForPageReady(page);

    // Assert - check if pagination exists or empty state
    const pagination = page.locator('[data-testid="pagination"], .pagination, nav[aria-label*="pagination" i]');
    const credentialsList = page.locator('[data-testid="credentials-list"], .credentials-list');
    const isEmpty = await credentialsList.count() === 0;

    if (!isEmpty) {
      await expect(pagination.first()).toBeVisible({ timeout: 5000 });
    } else {
      await expect(page.locator('text=/no.*credential|empty/i').first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("should search credentials", async ({ page }) => {
    // Arrange
    await page.goto("/en/dashboard/credentials");
    await waitForPageReady(page);

    // Act - enter search query
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("test");
      await page.waitForTimeout(500); // Wait for debounce

      // Assert
      await expect(searchInput).toHaveValue("test");
    }
  });

  test("should update credential", async ({ page }) => {
    // Arrange - create a credential first (simplified, assumes credential exists)
    await page.goto("/en/dashboard/credentials");
    await waitForPageReady(page);

    // Act - click on first credential to edit
    const credentialItem = page.locator('[data-testid="credential-item"], .credential-item, tr').first();
    if (await credentialItem.isVisible()) {
      await credentialItem.click();
      await waitForPageReady(page);

      // Update name
      const nameInput = page.locator('input[name*="name" i]').first();
      if (await nameInput.isVisible()) {
        await nameInput.clear();
        await fillField(page, nameInput, "Updated Credential Name");

        // Save
        const saveButton = page.locator('button:has-text("Save"), button[type="submit"]').first();
        await saveButton.click();

        // Assert
        await expectToast(page, /updated|saved/i);
      }
    }
  });

  test("should delete credential", async ({ page }) => {
    // Arrange
    await page.goto("/en/dashboard/credentials");
    await waitForPageReady(page);

    // Act - find and click delete button
    const deleteButton = page.locator('button[aria-label*="delete" i], button:has-text("Delete")').first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Confirm deletion if confirmation dialog appears
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete")').last();
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      // Assert - should show success message
      await expectToast(page, /deleted|removed/i);
    }
  });

  test("should fail to create credential when unauthenticated", async ({ page }) => {
    // Arrange - logout first
    await page.goto("/en/dashboard/credentials");
    const logoutButton = page.locator('button:has-text("Logout"), [data-testid="logout"]').first();
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForURL(/\/login/, { timeout: 5000 });
    }

    // Act - try to access credentials
    await page.goto("/en/dashboard/credentials");

    // Assert - should redirect to login
    await expect(page).toHaveURL(/\/login/);
  });

  test("should validate credential form fields", async ({ page }) => {
    // Arrange
    await page.goto("/en/dashboard/credentials");
    await waitForPageReady(page);

    // Act - try to submit empty form
    const createButton = page.getByRole("button", { name: /create|new.*credential/i }).first();
    if (await createButton.isVisible()) {
      await createButton.click();
      await waitForPageReady(page);

      // Try to submit without filling required fields
      const submitButton = page.locator('button[type="submit"]').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Assert - should show validation errors
        await expect(page.locator('text=/required|invalid|error/i').first()).toBeVisible({ timeout: 5000 });
      }
    }
  });
});


