import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";

import { CphField } from "../src";

const meta: Meta<typeof CphField> = {
  title: "Colophon/Forms/CphField",
  component: CphField,
  args: { label: "Inquiry title" },
};
export default meta;
type S = StoryObj<typeof CphField>;

export const Default: S = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const input = c.getByRole("textbox", { name: "Inquiry title" });
    await userEvent.type(input, "Road salt in winter");
    await expect(input).toHaveValue("Road salt in winter");
  },
};

export const Error: S = {
  args: { validate: (v: string) => (v.length < 3 ? "Too short." : true) },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const input = c.getByRole("textbox", { name: "Inquiry title" });
    await userEvent.type(input, "ab");
    await userEvent.tab();
    await expect(c.getByRole("alert")).toHaveTextContent("Too short.");

    await userEvent.clear(input);
    await userEvent.type(input, "abc");
    await userEvent.tab();
    await expect(c.queryByRole("alert")).not.toBeInTheDocument();
  },
};

export const Disabled: S = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const input = c.getByRole("textbox", { name: "Inquiry title" });
    await expect(input).toBeDisabled();
  },
};

export const WithHelp: S = { args: { help: "Provide a concise, descriptive title." } };

export const Optional: S = { args: { marker: "optional" } };
