import { expect, test } from "@playwright/test";

import { clearSession, loginAs } from "./helpers/auth";
import { E2E_ADMIN_EMAIL, E2E_PASSWORD } from "./helpers/credentials";

test.describe("auth", () => {
  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test("unauthenticated visit redirects to login with next", async ({
    page,
  }) => {
    await page.goto("/users");
    await expect(page).toHaveURL(/\/login\?next=/);
    expect(page.url()).toContain(encodeURIComponent("/users"));
  });

  test("login success lands on users", async ({ page }) => {
    await loginAs(page, E2E_ADMIN_EMAIL);
    await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
    await expect(
      page.locator("header").getByText(E2E_ADMIN_EMAIL),
    ).toBeVisible();
  });

  test("bad credentials show error", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill(E2E_ADMIN_EMAIL);
    await page.locator("#password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Invalid email or password.")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("logout clears session", async ({ page }) => {
    await loginAs(page, E2E_ADMIN_EMAIL, E2E_PASSWORD);
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/login/);
    await page.goto("/users");
    await expect(page).toHaveURL(/\/login\?next=/);
  });
});
