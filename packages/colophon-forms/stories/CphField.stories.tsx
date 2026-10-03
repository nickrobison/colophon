import type { Meta, StoryObj } from "@storybook/react";

import { CphField } from "../src";

const meta: Meta<typeof CphField> = {
  title: "Colophon/Forms/CphField",
  component: CphField,
  args: { label: "Inquiry title" },
};
export default meta;
type S = StoryObj<typeof CphField>;

export const Default: S = {};

export const Error: S = {
  args: { validate: (v: string) => (v.length < 3 ? "Too short." : true) },
};

export const Disabled: S = { args: { isDisabled: true } };

export const WithHelp: S = { args: { help: "Provide a concise, descriptive title." } };

export const Optional: S = { args: { marker: "optional" } };
