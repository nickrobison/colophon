import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";

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

export const Default: S = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const team = c.getByRole("radio", { name: /Research team/ });
    await expect(team).not.toBeChecked();
    await userEvent.click(team);
    await expect(team).toBeChecked();

    const priv = c.getByRole("radio", { name: /Private draft/ });
    await userEvent.click(priv);
    await expect(priv).toBeChecked();
    await expect(team).not.toBeChecked();
  },
};

export const Disabled: S = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("radio", { name: /Research team/ })).toBeDisabled();
  },
};

export const WithHelp: S = { args: { help: "Choose who can see this inquiry." } };
