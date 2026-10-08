/** @packageDocumentation Playwright style and a11y assertions. */

import { expect, test } from "@playwright/test";

const dataTableStory = "/iframe.html?id=components-cphdatatablee2e--default&viewMode=story";
const summaryStory = "/iframe.html?id=components-cphtoolbare2e--summary&viewMode=story";
const emptyStory = "/iframe.html?id=components-cphtoolbare2e--empty&viewMode=story";
const skeletonStory = "/iframe.html?id=components-cphtoolbare2e--skeleton&viewMode=story";

test.describe("Table styles", () => {
  test("density height", async ({ page }) => {
    await page.goto(dataTableStory);
    const table = page.locator("table.cph-table");
    await expect(table).toBeVisible();
    const lineHeight = await table.evaluate(
      (element) => window.getComputedStyle(element).lineHeight,
    );
    expect(lineHeight).toBeTruthy();
  });

  test("theme colors", async ({ page }) => {
    await page.goto(dataTableStory);
    const root = page.locator(".cph-table-root");
    await expect(root).toBeVisible();
    const background = await root.evaluate(
      (element) => window.getComputedStyle(element).backgroundColor,
    );
    expect(background).toBeTruthy();
  });

  test("pin styling", async ({ page }) => {
    await page.goto(dataTableStory);
    const nameHeader = page.locator("[data-cph-table='header-cell']").filter({ hasText: "Name" });
    await nameHeader.getByRole("button", { name: "Pin column" }).click();
    const cell = page.locator(".cph-table__pinned").first();
    await expect(cell).toBeVisible();
    const position = await cell.evaluate((element) => window.getComputedStyle(element).position);
    expect(position).toBe("sticky");
  });

  test("summary rules", async ({ page }) => {
    await page.goto(summaryStory);
    const summary = page.locator("tfoot");
    await expect(summary).toBeVisible();
    const font = await summary.evaluate((element) => window.getComputedStyle(element).fontFamily);
    expect(font).toBeTruthy();
  });

  test("tabular nums", async ({ page }) => {
    await page.goto(dataTableStory);
    const cell = page.locator("td").filter({ hasText: "42" });
    await expect(cell).toBeVisible();
    const variant = await cell.evaluate(
      (element) => window.getComputedStyle(element).fontVariantNumeric,
    );
    expect(variant).toContain("tabular-nums");
  });

  test("table surface", async ({ page }) => {
    await page.goto(dataTableStory);
    const table = page.locator("table.cph-table");
    await expect(table).toBeVisible();
    const collapse = await table.evaluate(
      (element) => window.getComputedStyle(element).borderCollapse,
    );
    expect(collapse).toBe("separate");
  });

  test("focus state", async ({ page }) => {
    await page.goto(dataTableStory);
    const button = page.getByRole("button", { name: "Sort ascending" }).first();
    await button.focus();
    const display = await button.evaluate((element) => window.getComputedStyle(element).display);
    expect(display).toBe("inline-flex");
  });

  test("hover state", async ({ page }) => {
    await page.goto(dataTableStory);
    const row = page.locator("tr.cph-table__row").first();
    await row.hover();
    const cursor = await row.evaluate((element) => window.getComputedStyle(element).cursor);
    expect(cursor).toBe("pointer");
  });

  test("selected state", async ({ page }) => {
    await page.goto(dataTableStory);
    const nameHeader = page.locator("[data-cph-table='header-cell']").filter({ hasText: "Name" });
    await nameHeader.getByRole("button", { name: "Pin column" }).click();
    const row = page.locator("tr.cph-table__row").first();
    await row.getByRole("checkbox", { name: "Select Alpha" }).check();
    const cell = row.locator(".cph-table__pinned");
    const shadow = await cell.evaluate((element) => window.getComputedStyle(element).boxShadow);
    expect(shadow).toContain("inset");
  });

  test("empty state", async ({ page }) => {
    await page.goto(emptyStory);
    const empty = page.locator("[data-cph-table='empty-message']");
    await expect(empty).toBeVisible();
    const color = await empty.evaluate((element) => window.getComputedStyle(element).color);
    expect(color).toBeTruthy();
  });

  test("skeleton pulse", async ({ page }) => {
    await page.goto(skeletonStory);
    const skeleton = page.locator("[data-cph-table='skeleton-bar']").first();
    await expect(skeleton).toBeVisible();
    const animation = await skeleton.evaluate(
      (element) => window.getComputedStyle(element).animation,
    );
    expect(animation).toContain("cph-table-pulse");
  });
});
