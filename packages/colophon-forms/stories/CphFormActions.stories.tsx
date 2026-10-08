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
          "**Discard confirmation is opt-in.** " +
          "Set `confirmDiscard` to `true` for the default “Discard unsaved changes?” prompt, " +
          'or supply custom copy, e.g. `confirmDiscard="Leave without saving?"`. ' +
          "Dirty forms call `onDiscard` only after confirmation; cancelling preserves edits. " +
          "Clean forms never prompt. Without `confirmDiscard`, Back calls `onDiscard` " +
          "unconditionally: callers must confirm before resetting or navigating away from " +
          "unsaved changes. Leave it disabled to provide a custom modal or routing flow. " +
          "`CphForm` accepts the same prop for its footer.",
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

export const ConfirmDiscard: S = {
  args: { isDirty: true, onDiscard: fn(), confirmDiscard: true },
  parameters: {
    docs: {
      description: {
        story:
          "Click Back to accept or cancel the default confirmation. No edits are discarded here.",
      },
    },
  },
};

export const CustomDiscardConfirmation: S = {
  args: { isDirty: true, onDiscard: fn(), confirmDiscard: "Leave without saving?" },
};

export const CleanWithConfirmation: S = {
  args: { isDirty: false, onDiscard: fn(), confirmDiscard: true },
};
