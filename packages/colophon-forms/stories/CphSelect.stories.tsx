import type { Meta, StoryObj } from "@storybook/react";

import { CphSelect } from "../src";

const options = [
  { value: "working", label: "Working inquiry" },
  { value: "formal", label: "Formal research programme" },
  { value: "review", label: "Literature review" },
];

const meta: Meta<typeof CphSelect> = {
  title: "Colophon/Forms/CphSelect",
  component: CphSelect,
  args: { label: "Inquiry type", options },
};
export default meta;
type S = StoryObj<typeof CphSelect>;

export const Default: S = {};

export const WithHelp: S = { args: { help: "Choose the category that best fits your inquiry." } };

export const Optional: S = { args: { marker: "optional" } };

export const Disabled: S = { args: { isDisabled: true } };

export const Invalid: S = { args: { isInvalid: true } };
