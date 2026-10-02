import type { Meta, StoryObj } from "@storybook/react";

import { CphTextarea } from "../src";

const meta: Meta<typeof CphTextarea> = {
  title: "Colophon/Forms/CphTextarea",
  component: CphTextarea,
  args: { label: "Description", rows: 5 },
};
export default meta;
type S = StoryObj<typeof CphTextarea>;

export const Default: S = {};

export const Error: S = {
  args: { validate: (v: string) => (v.length < 3 ? "Too short." : true) },
};

export const Disabled: S = { args: { isDisabled: true } };

export const WithHelp: S = { args: { help: "Explain the scope and intent of the inquiry." } };

export const Optional: S = { args: { marker: "optional" } };

export const Rows12: S = { args: { rows: 12 } };
