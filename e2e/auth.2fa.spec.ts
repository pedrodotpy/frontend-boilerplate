import { expect, test } from "@playwright/test";

import { clearSession } from "./helpers/auth";
import { E2E_ADMIN_EMAIL, E2E_PASSWORD } from "./helpers/credentials";
import { readLatestAuthCode } from "./helpers/otp";

const login2faEnabled = process.env.E2E_LOGIN_2FA === "1";

test.describe("auth 2FA (live API)", () => {
  test.skip(
    !login2faEnabled,
    "Set E2E_LOGIN_2FA=1 and run Django with LOGIN_2FA_ENABLED=True",
  );

  test.beforeEach(async ({ page }) => {
    await clearSession(page);
  });

  test("login challenges then verifies with email code", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill(E2E_ADMIN_EMAIL);
    await page.locator("#password").fill(E2E_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.locator("#code")).toBeVisible();
    await expect(
      page.getByText(/Enter the code sent to e\*\*\*@/),
    ).toBeVisible();

    const code = await readLatestAuthCode({
      email: E2E_ADMIN_EMAIL,
      purpose: "login",
    });
    await page.locator("#code").fill(code);
    await page.getByRole("button", { name: "Verify" }).click();
    await page.waitForURL(/\/users/);
    await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
  });

  test("bad verification code shows error", async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill(E2E_ADMIN_EMAIL);
    await page.locator("#password").fill(E2E_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.locator("#code")).toBeVisible();

    await page.locator("#code").fill("000000");
    await page.getByRole("button", { name: "Verify" }).click();
    await expect(page.getByText("Invalid or expired code.")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});
