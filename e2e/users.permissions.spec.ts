import { expect, test } from "@playwright/test";

import { clearSession, loginAs } from "./helpers/auth";
import { E2E_VIEWER_EMAIL } from "./helpers/credentials";

test.describe("users permissions", () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await loginAs(page, E2E_VIEWER_EMAIL);
  });

  test("viewer can list and view but not mutate", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Create user" })).toHaveCount(
      0,
    );

    const firstView = page.getByRole("link", { name: "View" }).first();
    await firstView.click();
    await expect(page).toHaveURL(/\/users\/\d+/);
    await expect(page.getByRole("link", { name: "Edit" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Delete" })).toHaveCount(0);

    await page.goto("/users/new");
    await expect(page.getByTestId("forbidden")).toBeVisible();
    await expect(page.getByText("users.add_user")).toBeVisible();
  });
});
