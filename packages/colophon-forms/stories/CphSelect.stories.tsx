import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";

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

export const Default: S = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const trigger = c.getByLabelText("Inquiry type");
    await userEvent.click(trigger);
    await expect(c.getByRole("option", { name: "Literature review" })).toBeVisible();

    await userEvent.click(c.getByRole("option", { name: "Literature review" }));
    await expect(trigger).toHaveTextContent("Literature review");
  },
};

export const Disabled: S = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByLabelText("Inquiry type")).toBeDisabled();
  },
};

export const WithHelp: S = { args: { help: "Choose the category that best fits your inquiry." } };

export const Optional: S = { args: { marker: "optional" } };

export const Invalid: S = { args: { isInvalid: true } };
