import { test, expect } from "playwright/test";

const STORY = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

test.describe("Colophon Forms E2E", () => {
  test("Field typing + validation error appears and clears", async ({ page }) => {
    await page.goto(STORY("colophon-forms-cphfield--error"));

    const input = page.getByRole("textbox", { name: "Inquiry title" });

    // Type a too-short value and blur → error should appear
    await input.fill("ab");
    await input.evaluate((el) => el.blur());

    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toHaveText(/Too short/);

    // Type enough characters and blur → error should disappear
    await input.fill("abc");
    await input.evaluate((el) => el.blur());

    await expect(page.getByRole("alert")).not.toBeVisible();
  });

  test("Focus ring / focus state", async ({ page }) => {
    await page.goto(STORY("colophon-forms-cphfield--default"));

    const input = page.getByRole("textbox", { name: "Inquiry title" });
    await input.focus();
    await expect(input).toBeFocused();
  });

  test("Disabled field is not editable", async ({ page }) => {
    await page.goto(STORY("colophon-forms-cphfield--disabled"));

    const input = page.getByRole("textbox", { name: "Inquiry title" });
    await expect(input).toBeDisabled();

    // Typing should not change the value
    await input.fill("should not appear");
    await expect(input).toHaveValue("");
  });

  test("Select opens and selection updates the trigger", async ({ page }) => {
    await page.goto(STORY("colophon-forms-cphselect--default"));

    const trigger = page.getByRole("button", { name: "Inquiry type" });
    await trigger.click();

    const options = page.getByRole("option");
    await expect(options).toHaveCount(3);

    await page.getByRole("option", { name: "Formal research programme" }).click();

    // After selection, the trigger should show the selected option's label
    await expect(trigger).toHaveText("Formal research programme");
  });

  test("Checkbox toggles", async ({ page }) => {
    await page.goto(STORY("colophon-forms-cphcheckbox--default"));

    const checkbox = page.getByRole("checkbox", {
      name: "Include related correspondence",
    });

    // Initially unchecked
    await expect(checkbox).toHaveAttribute("aria-checked", "false");

    // Click to check
    await checkbox.click();
    await expect(checkbox).toHaveAttribute("aria-checked", "true");

    // Click again to uncheck
    await checkbox.click();
    await expect(checkbox).toHaveAttribute("aria-checked", "false");
  });

  test("Error summary links to its field", async ({ page }) => {
    await page.goto(STORY("colophon-forms-cpherrorsummary--with-errors"));

    const link = page.getByRole("link", { name: "Title is required." });
    await link.click();

    // The URL hash should change to the target anchor
    await expect(page).toHaveURL(/#title/);
  });

  test("StepIndicator shows step count", async ({ page }) => {
    await page.goto(STORY("colophon-forms-cphstepindicator--mid-flow"));

    await expect(page.getByText("Step 2 of 3")).toBeVisible();
  });

  test("Keyboard-only operation", async ({ page }) => {
    await page.goto(STORY("colophon-forms-cphfield--error"));

    const input = page.getByRole("textbox", { name: "Inquiry title" });

    // Tab to the field (keyboard-only navigation)
    await page.keyboard.press("Tab");
    await expect(input).toBeFocused();

    // Type a too-short value
    await input.type("ab");

    // Tab away to trigger blur → validation error should appear
    await page.keyboard.press("Tab");

    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toHaveText(/Too short/);
  });
});
