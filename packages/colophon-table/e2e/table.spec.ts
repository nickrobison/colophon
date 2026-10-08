/** @packageDocumentation Playwright behaviour tests for table components. */

import { expect, test } from "@playwright/test";

const dataTableStory = "/iframe.html?id=components-cphdatatablee2e--default&viewMode=story";
const toolbarStory = "/iframe.html?id=components-cphtoolbare2e--toolbar&viewMode=story";
const paginationStory = "/iframe.html?id=components-cphtoolbare2e--pagination&viewMode=story";
const summaryStory = "/iframe.html?id=components-cphtoolbare2e--summary&viewMode=story";
const skeletonStory = "/iframe.html?id=components-cphtoolbare2e--skeleton&viewMode=story";
const emptyStory = "/iframe.html?id=components-cphtoolbare2e--empty&viewMode=story";
const sheetStory = "/iframe.html?id=components-cphtoolbare2e--sort-filter-sheet&viewMode=story";

test.describe("Table", () => {
  test("sorts by column", async ({ page }) => {
    await page.goto(dataTableStory);
    const nameHeader = page.locator("[data-cph-table='header-cell']").filter({ hasText: "Name" });
    await nameHeader.getByRole("button", { name: "Sort ascending" }).click();
    await expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
    await expect(page.getByRole("row").nth(1)).toContainText("Alpha");
  });

  test("pins first column", async ({ page }) => {
    await page.goto(dataTableStory);
    const nameHeader = page.locator("[data-cph-table='header-cell']").filter({ hasText: "Name" });
    await nameHeader.getByRole("button", { name: "Pin column" }).click();
    await expect(nameHeader).toHaveAttribute("data-pinned", "start");
    await expect(nameHeader).toHaveClass(/cph-table__pinned-head/);
  });

  test("expands rows", async ({ page }) => {
    await page.goto(dataTableStory);
    const firstRow = page.getByRole("row").nth(1);
    await firstRow.getByRole("button", { name: "Expand Alpha" }).click();
    await expect(firstRow.getByRole("button", { name: "Expand Alpha" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await expect(page.getByText("Alpha detail")).toBeVisible();
  });

  test("selects rows", async ({ page }) => {
    await page.goto(dataTableStory);
    const firstRow = page.getByRole("row").nth(1);
    await firstRow.getByRole("checkbox", { name: "Select Alpha" }).check();
    await expect(firstRow).toHaveAttribute("data-selected", "true");
  });

  test("shows summary", async ({ page }) => {
    await page.goto(summaryStory);
    const summary = page.locator("tfoot[data-cph-table='summary']");
    await expect(summary).toBeVisible();
    await expect(summary).toContainText("Summary");
    await expect(summary).toContainText("147");
  });

  test("filters rows", async ({ page }) => {
    await page.goto(toolbarStory);
    await expect(page.locator(".cph-table__filter")).toBeVisible();
    const category = page.getByRole("button", { name: "Category" });
    await category.click();
    await expect(page.getByRole("option", { name: "Source" })).toBeVisible();
  });

  test("paginates", async ({ page }) => {
    await page.goto(paginationStory);
    await expect(page.getByText("Page 2 of 5")).toBeVisible();
    await page.getByRole("button", { name: "Next page" }).click();
    await expect(page.getByText("Page 3 of 5")).toBeVisible();
  });

  test("searches", async ({ page }) => {
    await page.goto(toolbarStory);
    const search = page.getByRole("searchbox", { name: "Search table" });
    await search.fill("beta");
    await expect(search).toHaveValue("beta");
  });

  test("changes page size", async ({ page }) => {
    await page.goto(paginationStory);
    const pageSize = page.getByRole("button", { name: "Rows per page" });
    await pageSize.click();
    await page.getByRole("option", { name: "12" }).click();
    await expect(pageSize).toContainText("12");
  });

  test("renders skeleton", async ({ page }) => {
    await page.goto(skeletonStory);
    await expect(page.locator("[data-cph-table='skeleton-row']")).toHaveCount(3);
    await expect(page.locator("[data-cph-table='skeleton-bar']").first()).toBeVisible();
  });

  test("shows empty state", async ({ page }) => {
    await page.goto(emptyStory);
    const empty = page.locator("[data-cph-table='empty-state']");
    await expect(empty).toBeVisible();
    await expect(empty).toContainText("No records found");
  });

  test("opens the sort and filter sheet", async ({ page }) => {
    await page.goto(sheetStory);
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Filter controls")).toBeVisible();
  });
});
