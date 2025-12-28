import { test, expect } from "@playwright/test";

test.describe("Credentials E2E", () => {
  test.beforeEach(async ({ page }) => {
    // TODO: Setup authentication before each test
    await page.goto("/dashboard/credentials");
  });

  test("should display credentials list", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /credentials/i })).toBeVisible();
  });

  test("should navigate to credentials page", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: /credentials/i }).click();
    await expect(page).toHaveURL(/.*credentials/);
  });
});

