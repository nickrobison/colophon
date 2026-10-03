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

    // Playwright's fill() blocks on actionability, so assert editability
    // directly rather than trying to type into a field that must refuse input.
    expect(await input.isEditable()).toBe(false);
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

    // React Aria renders a native input, so checkedness is the `checked`
    // property rather than an aria-checked attribute.
    await expect(checkbox).not.toBeChecked();

    // That input is visually hidden, so it fails Playwright's actionability
    // check. Click the wrapping label, which is what a user actually clicks.
    // CphCheckbox puts its choice classes on that label rather than a wrapper,
    // and React Aria nests a second label inside it.
    const label = page
      .locator("label.cph-choice--checkbox")
      .filter({ hasText: "Include related correspondence" });

    await label.click();
    await expect(checkbox).toBeChecked();

    await label.click();
    await expect(checkbox).not.toBeChecked();
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

    // Tab until the field takes focus: inside a Storybook iframe the first Tab
    // can land on the preview wrapper, so a single press is not reliable.
    for (let attempt = 0; attempt < 5; attempt += 1) {
      if (await input.evaluate((el) => el === document.activeElement)) break;
      await page.keyboard.press("Tab");
    }
    await expect(input).toBeFocused();

    await input.pressSequentially("ab");

    // Tab away to trigger blur → validation error should appear
    await page.keyboard.press("Tab");

    const alert = page.getByRole("alert");
    await expect(alert).toBeVisible();
    await expect(alert).toHaveText(/Too short/);
  });
});
