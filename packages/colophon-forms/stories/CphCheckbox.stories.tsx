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
    // The native input is visually hidden, so click the wrapping label the way
    // a user would rather than the control itself.
    const label = canvasElement.querySelector("label.cph-choice--checkbox");
    if (!label) throw new Error("checkbox label not rendered");
    await userEvent.click(label);
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
  args: { isInvalid: true, errorMessage: "You must confirm this to proceed." },
};

export const WithHelp: S = {
  args: { help: "Correspondence will be attached to the inquiry record." },
};
