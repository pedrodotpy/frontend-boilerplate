import { expect, test } from "@playwright/test";

import { clearSession, loginAs } from "./helpers/auth";
import { E2E_ADMIN_EMAIL } from "./helpers/credentials";

test.describe("users pagination", () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await loginAs(page, E2E_ADMIN_EMAIL);
  });

  test("next and previous update offset query params", async ({ page }) => {
    await page.goto("/users?limit=5&offset=0");
    await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
    await expect(page.getByText(/Showing \d+/)).toBeVisible();

    const next = page.getByRole("button", { name: "Next" });
    await expect(next).toBeEnabled();
    await next.click();
    await expect(page).toHaveURL(/limit=5/);
    await expect(page).toHaveURL(/offset=5/);
    await expect(page.getByText("offset 5")).toBeVisible();

    const prev = page.getByRole("button", { name: "Previous" });
    await expect(prev).toBeEnabled();
    await prev.click();
    await expect(page).toHaveURL(/offset=0/);
    await expect(page.getByText("offset 0")).toBeVisible();
  });
});
