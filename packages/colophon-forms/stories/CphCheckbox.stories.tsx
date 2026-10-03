import type { Meta, StoryObj } from "@storybook/react";

import { CphCheckbox } from "../src";

const meta: Meta<typeof CphCheckbox> = {
  title: "Colophon/Forms/CphCheckbox",
  component: CphCheckbox,
  args: { label: "Include related correspondence" },
};
export default meta;
type S = StoryObj<typeof CphCheckbox>;

export const Default: S = {};

export const Checked: S = { args: { isSelected: true } };

export const Disabled: S = { args: { isDisabled: true } };

export const WithError: S = {
  args: { isInvalid: true, errorMessage: "You must confirm this to proceed." },
};

export const WithHelp: S = {
  args: { help: "Correspondence will be attached to the inquiry record." },
};
