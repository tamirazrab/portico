import { test, expect } from "@playwright/test";

test.describe("Workflows E2E", () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Setup authentication before each test
    // For now, assuming user is already logged in
    await page.goto("/dashboard/workflows");
  });

  test("should display workflows list", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /workflows/i })).toBeVisible();
  });

  test("should navigate to workflows page", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: /workflows/i }).click();
    await expect(page).toHaveURL(/.*workflows/);
  });
});

