import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";

import { CphCheckbox } from "../src";

const meta: Meta<typeof CphCheckbox> = {
  title: "Colophon/Forms/CphCheckbox",
  component: CphCheckbox,
  args: { label: "Include related correspondence" },
};
export default meta;
type S = StoryObj<typeof CphCheckbox>;

export const Default: S = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const box = c.getByRole("checkbox", { name: "Include related correspondence" });
    await expect(box).not.toBeChecked();
    // Do not replace this with a click: the input is clipped to 1px, so
    // synthetic pointer presses get swallowed by the styled wrapper.
    box.focus();
    if (canvasElement.ownerDocument.activeElement !== box) {
      throw new Error("checkbox did not take focus");
    }
    await userEvent.keyboard(" ");
    await expect(box).toBeChecked();
  },
};

export const Checked: S = { args: { isSelected: true } };

export const Disabled: S = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(
      c.getByRole("checkbox", { name: "Include related correspondence" }),
    ).toBeDisabled();
  },
};

export const WithError: S = {
  args: { errorMessage: "You must confirm this to proceed." },
};

export const WithHelp: S = {
  args: { help: "Correspondence will be attached to the inquiry record." },
};
