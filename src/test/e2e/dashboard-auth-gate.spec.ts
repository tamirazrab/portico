import { expect, test } from "@playwright/test";

test.describe("Dashboard auth gating", () => {
  test("redirects unauthenticated users away from dashboard", async ({
    page,
  }) => {
    await page.goto("/en/dashboard/workflows");
    await expect(page).toHaveURL(/\/en\/login/);
  });
});
