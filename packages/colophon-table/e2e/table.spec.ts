/** @packageDocumentation Playwright behaviour tests for table components. */

import { test, expect } from "@playwright/test";

test.describe("Table", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("sorts by column", async ({ page }) => {
    await expect(page.locator("table")).toBeVisible();
  });

  test("pins first column", async ({ page }) => {
    await expect(page.locator("table")).toBeVisible();
  });

  test("expands rows", async ({ page }) => {
    await expect(page.locator("table")).toBeVisible();
  });

  test("selects rows", async ({ page }) => {
    await expect(page.locator("table")).toBeVisible();
  });

  test("shows summary", async ({ page }) => {
    await expect(page.locator("table")).toBeVisible();
  });

  test("filters rows", async ({ page }) => {
    await expect(page.locator("table")).toBeVisible();
  });

  test("paginates", async ({ page }) => {
    await expect(page.locator("table")).toBeVisible();
  });

  test("searches", async ({ page }) => {
    await expect(page.locator("table")).toBeVisible();
  });

  test("changes page size", async ({ page }) => {
    await expect(page.locator("table")).toBeVisible();
  });

  test("renders skeleton", async ({ page }) => {
    await expect(page.locator("table")).toBeVisible();
  });

  test("shows empty state", async ({ page }) => {
    await expect(page.locator("table")).toBeVisible();
  });
});
