import type { Page } from "@playwright/test";

import { E2E_PASSWORD } from "./credentials";

export async function loginAs(
  page: Page,
  email: string,
  password: string = E2E_PASSWORD,
) {
  await page.goto("/login");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/users/);
}

export async function clearSession(page: Page) {
  await page.goto("/login");
  await page.evaluate(() => {
    localStorage.clear();
  });
}
