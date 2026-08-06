import { expect, test } from "@playwright/test";

import { clearSession, loginAs } from "./helpers/auth";
import { E2E_ADMIN_EMAIL, E2E_PASSWORD, E2E_VIEWER_EMAIL } from "./helpers/credentials";
import { readLatestAuthCode, setUserPassword } from "./helpers/otp";

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

  test("forgot password page is reachable from login", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Forgot password?" }).click();
    await expect(page).toHaveURL(/\/forgot-password/);
    await expect(
      page.getByRole("heading", { name: "Forgot password" }),
    ).toBeVisible();
    await page.locator("#email").fill(E2E_ADMIN_EMAIL);
    await page.getByRole("button", { name: "Send reset code" }).click();
    await expect(
      page.getByRole("heading", { name: "Check your email" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Enter reset code" }).click();
    await expect(page).toHaveURL(/\/reset-password/);
    await expect(page.locator("#email")).toHaveValue(E2E_ADMIN_EMAIL);
  });

  test("reset password page validates password mismatch", async ({ page }) => {
    await page.goto(
      `/reset-password?email=${encodeURIComponent(E2E_ADMIN_EMAIL)}`,
    );
    await page.locator("#code").fill("123456");
    await page.locator("#new_password").fill("brand-new-pass-99");
    await page.locator("#confirm_password").fill("different-pass-99");
    await page.getByRole("button", { name: "Update password" }).click();
    await expect(page.getByText("Passwords do not match.")).toBeVisible();
  });

  test("forgot password reset with live OTP then login", async ({ page }) => {
    const resetEmail = E2E_VIEWER_EMAIL;
    const temporaryPassword = "brand-new-pass-99";

    await page.goto("/forgot-password");
    await page.locator("#email").fill(resetEmail);
    await page.getByRole("button", { name: "Send reset code" }).click();
    await expect(
      page.getByRole("heading", { name: "Check your email" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Enter reset code" }).click();
    await expect(page).toHaveURL(/\/reset-password/);

    const code = await readLatestAuthCode({
      email: resetEmail,
      purpose: "password_reset",
    });
    await page.locator("#code").fill(code);
    await page.locator("#new_password").fill(temporaryPassword);
    await page.locator("#confirm_password").fill(temporaryPassword);
    await page.getByRole("button", { name: "Update password" }).click();
    await expect(page).toHaveURL(/\/login/);

    await loginAs(page, resetEmail, temporaryPassword);
    await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
    await expect(page.locator("header").getByText(resetEmail)).toBeVisible();

    await setUserPassword(resetEmail, E2E_PASSWORD);
  });
});
