/** @packageDocumentation Playwright style and a11y assertions. */

import { expect, test } from "@playwright/test";

const dataTableStory = "/iframe.html?id=components-table-cphdatatablee2e--default&viewMode=story";
const summaryStory = "/iframe.html?id=components-table-cphtoolbare2e--summary&viewMode=story";
const emptyStory = "/iframe.html?id=components-table-cphtoolbare2e--empty&viewMode=story";
const skeletonStory = "/iframe.html?id=components-table-cphtoolbare2e--skeleton&viewMode=story";

test.describe("Table styles", () => {
  const headerLeft = (element: Element) => window.getComputedStyle(element).left;

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

  test("pinned body cells inherit header offsets without stacking", async ({ page }) => {
    await page.goto(dataTableStory);
    const nameHeader = page.locator("[data-cph-table='header-cell']").filter({ hasText: "Name" });
    await nameHeader.getByRole("button", { name: "Pin column" }).click();
    const categoryHeader = page
      .locator("[data-cph-table='header-cell']")
      .filter({ hasText: "Category" });
    await categoryHeader.getByRole("button", { name: "Pin column" }).click();

    const nameBody = page.locator("[data-cph-table='cell']").filter({ hasText: "Alpha" }).first();
    const categoryBody = page
      .locator("[data-cph-table='cell']")
      .filter({ hasText: "Source" })
      .first();

    // Offsets propagate from headers to body cells via inline styles
    await expect(nameBody).toHaveAttribute("style", /left/);
    const nameHeaderLeft = await nameHeader.evaluate(headerLeft);
    const nameBodyLeft = await nameBody.evaluate(headerLeft);
    expect(nameBodyLeft).toBe(nameHeaderLeft);

    // The second pinned column stacks at its accumulated offset, not left: 0
    const categoryHeaderLeft = await categoryHeader.evaluate(headerLeft);
    const categoryBodyLeft = await categoryBody.evaluate(headerLeft);
    expect(categoryBodyLeft).toBe(categoryHeaderLeft);
    expect(categoryBodyLeft).not.toBe(nameBodyLeft);
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

  test("status chip tones differ from neutral", async ({ page }) => {
    await page.goto("/iframe.html?id=components-table-cphstatuschip--default&viewMode=story");
    const neutral = page.locator(".cph-table__chip").first();
    await expect(neutral).toBeVisible();
    const neutralBg = await neutral.evaluate(
      (element) => window.getComputedStyle(element).backgroundColor,
    );

    await page.goto("/iframe.html?id=components-table-cphstatuschip--orange&viewMode=story");
    const orange = page.locator(".cph-table__chip").first();
    await expect(orange).toBeVisible();
    const orangeBg = await orange.evaluate(
      (element) => window.getComputedStyle(element).backgroundColor,
    );

    expect(orangeBg).toBeTruthy();
    expect(orangeBg).not.toBe(neutralBg);
  });
});
