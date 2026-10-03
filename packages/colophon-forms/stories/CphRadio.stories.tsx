import type { Meta, StoryObj } from "@storybook/react";

import { CphRadio } from "../src";

const options = [
  {
    value: "team",
    label: "Research team",
    description: "Visible to all members of the research team.",
  },
  {
    value: "private",
    label: "Private draft",
    description: "Visible only to you until you publish.",
  },
];

const meta: Meta<typeof CphRadio> = {
  title: "Colophon/Forms/CphRadio",
  component: CphRadio,
  args: { legend: "Visibility", options },
};
export default meta;
type S = StoryObj<typeof CphRadio>;

export const Default: S = {};

export const Disabled: S = { args: { isDisabled: true } };

export const WithHelp: S = { args: { help: "Choose who can see this inquiry." } };
