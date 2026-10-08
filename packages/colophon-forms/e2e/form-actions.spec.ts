import { test, expect } from "playwright/test";

test.describe("Form actions discard confirmation", () => {
  for (const { story, message } of [
    { story: "confirm-discard", message: "Discard unsaved changes?" },
    { story: "custom-discard-confirmation", message: "Leave without saving?" },
  ]) {
    for (const accepted of [false, true]) {
      test(`${story}: ${accepted ? "accept" : "cancel"} native confirmation`, async ({ page }) => {
        await page.goto(`/iframe.html?id=colophon-forms-cphformactions--${story}&viewMode=story`);
        await expect(page.getByText("Unsaved changes")).toBeVisible();

        const dialogPromise = page.waitForEvent("dialog");
        const clickPromise = page.getByRole("button", { name: "Back" }).click();
        const dialog = await dialogPromise;
        expect(dialog.type()).toBe("confirm");
        expect(dialog.message()).toBe(message);
        if (accepted) {
          await dialog.accept();
        } else {
          await dialog.dismiss();
        }
        await clickPromise;

        await expect(page.getByRole("button", { name: "Back" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Save" })).toBeEnabled();
      });
    }
  }

  test("clean forms skip native confirmation even when enabled", async ({ page }) => {
    let dialogs = 0;
    page.on("dialog", async (dialog) => {
      dialogs += 1;
      await dialog.dismiss();
    });
    await page.goto(
      "/iframe.html?id=colophon-forms-cphformactions--clean-with-confirmation&viewMode=story",
    );
    await expect(page.getByText("Draft up to date")).toBeVisible();

    await page.getByRole("button", { name: "Back" }).click();

    expect(dialogs).toBe(0);
    await expect(page.getByRole("button", { name: "Save" })).toBeEnabled();
  });
});
