/** @packageDocumentation Playwright behaviour tests for table components. */

import { test, expect } from "@playwright/test";

test.describe("Table", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("sorts by column", async ({ page }) => {
    // TODO: implement sort behavior
    await expect(page).toBeVisible();
  });

  test("pins first column", async ({ page }) => {
    // TODO: implement pin behavior
    await expect(page).toBeVisible();
  });

  test("expands rows", async ({ page }) => {
    // TODO: implement expand behavior
    await expect(page).toBeVisible();
  });

  test("selects rows", async ({ page }) => {
    // TODO: implement select behavior
    await expect(page).toBeVisible();
  });

  test("shows summary", async ({ page }) => {
    // TODO: implement summary behavior
    await expect(page).toBeVisible();
  });

  test("filters data", async ({ page }) => {
    // TODO: implement filter behavior
    await expect(page).toBeVisible();
  });

  test("paginates", async ({ page }) => {
    // TODO: implement pagination
    await expect(page).toBeVisible();
  });
});
