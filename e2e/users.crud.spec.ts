import { expect, test } from "@playwright/test";

import { clearSession, loginAs } from "./helpers/auth";
import { E2E_ADMIN_EMAIL } from "./helpers/credentials";

test.describe("users CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
    await loginAs(page, E2E_ADMIN_EMAIL);
  });

  test("create, view, edit, and delete a user", async ({ page }) => {
    const stamp = Date.now();
    const email = `e2e-crud-${stamp}@example.com`;
    const renamed = `e2e-crud-renamed-${stamp}@example.com`;

    await page.getByRole("link", { name: "Create user" }).click();
    await expect(page).toHaveURL(/\/users\/new/);
    await page.locator("#email").fill(email);
    await page.locator("#password").fill("crudpass123");
    await page.getByRole("button", { name: "Create" }).click();

    await expect(page).toHaveURL(/\/users\/\d+/);
    await expect(page.getByRole("heading", { name: email })).toBeVisible();

    await page.getByRole("link", { name: "Edit" }).click();
    await expect(page).toHaveURL(/\/users\/\d+\/edit/);
    await page.locator("#email").fill(renamed);
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page).toHaveURL(/\/users\/\d+/);
    await expect(page.getByRole("heading", { name: renamed })).toBeVisible();

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Delete" }).click();
    await expect(page).toHaveURL(/\/users/);
    await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
    await expect(page.getByText(renamed)).toHaveCount(0);
  });
});
