import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn, userEvent, within } from "@storybook/test";

import { CphFormActions } from "../src";

const meta: Meta<typeof CphFormActions> = {
  title: "Colophon/Forms/CphFormActions",
  component: CphFormActions,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "**Discard confirmation is the caller's responsibility.** " +
          "Activating Back calls `onDiscard` unconditionally, even when `isDirty` is true. " +
          "`isDirty` controls only the draft-status text; this component does not show a confirmation. " +
          "Callers must confirm before resetting or navigating away from unsaved changes. " +
          "The host application owns the confirmation copy and flow.",
      },
    },
  },
  args: { isDirty: false },
};
export default meta;
type S = StoryObj<typeof CphFormActions>;

export const Clean: S = { args: { isDirty: false } };

export const Dirty: S = { args: { isDirty: true } };

export const Submitting: S = { args: { isDirty: true, isSubmitting: true } };

export const WithDiscard: S = {
  args: { isDirty: true, onDiscard: fn() },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText("Unsaved changes")).toBeVisible();

    await userEvent.click(c.getByRole("button", { name: "Back" }));
    await expect(c.getByRole("button", { name: "Save" })).toBeVisible();
  },
};
