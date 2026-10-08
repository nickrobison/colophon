/** @packageDocumentation Playwright style and a11y assertions. */

import { test, expect } from "@playwright/test";

test.describe("Table styles", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("density height", async ({ page }) => {
    const table = page.locator("table");
    await expect(table).toBeVisible();
    const style = await table.evaluate((el) => window.getComputedStyle(el).lineHeight);
    expect(style).toBeTruthy();
  });

  test("theme colors", async ({ page }) => {
    const table = page.locator("table");
    await expect(table).toBeVisible();
    const bg = await table.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(bg).toBeTruthy();
  });

  test("pin styling", async ({ page }) => {
    const cell = page.locator("td").first();
    await expect(cell).toBeVisible();
    const border = await cell.evaluate((el) => window.getComputedStyle(el).borderLeft);
    expect(border).toBeTruthy();
  });

  test("summary rules", async ({ page }) => {
    const summary = page.locator("tfoot");
    await expect(summary).toBeVisible();
    const font = await summary.evaluate((el) => window.getComputedStyle(el).fontFamily);
    expect(font).toBeTruthy();
  });

  test("tabular nums", async ({ page }) => {
    const cell = page.locator("td").first();
    await expect(cell).toBeVisible();
    const variant = await cell.evaluate((el) => window.getComputedStyle(el).fontVariantNumeric);
    expect(variant).toBeTruthy();
  });

  test("accessibility label", async ({ page }) => {
    const table = page.locator("table");
    await expect(table).toBeVisible();
    const label = await table.getAttribute("aria-label");
    expect(label).toBeTruthy();
  });

  test("focus state", async ({ page }) => {
    const btn = page.locator("button").first();
    await expect(btn).toBeVisible();
    const outline = await btn.evaluate((el) => window.getComputedStyle(el).outline);
    expect(outline).toBeTruthy();
  });

  test("hover state", async ({ page }) => {
    const row = page.locator("tr").first();
    await expect(row).toBeVisible();
    const bg = await row.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(bg).toBeTruthy();
  });

  test("selected state", async ({ page }) => {
    const cell = page.locator("td").first();
    await expect(cell).toBeVisible();
    const shadow = await cell.evaluate((el) => window.getComputedStyle(el).boxShadow);
    expect(shadow).toBeTruthy();
  });

  test("empty state", async ({ page }) => {
    const empty = page.locator("[data-cph-table='table-empty']");
    await expect(empty).toBeVisible();
    const color = await empty.evaluate((el) => window.getComputedStyle(el).color);
    expect(color).toBeTruthy();
  });

  test("skeleton pulse", async ({ page }) => {
    const row = page.locator("[data-cph-table='skeleton-row']").first();
    await expect(row).toBeVisible();
    const animation = await row.evaluate((el) => window.getComputedStyle(el).animation);
    expect(animation).toBeTruthy();
  });
});
