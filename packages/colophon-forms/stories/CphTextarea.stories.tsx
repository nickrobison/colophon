import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";

import { CphTextarea } from "../src";

const meta: Meta<typeof CphTextarea> = {
  title: "Colophon/Forms/CphTextarea",
  component: CphTextarea,
  args: { label: "Description", rows: 5 },
};
export default meta;
type S = StoryObj<typeof CphTextarea>;

export const Default: S = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const input = c.getByRole("textbox", { name: "Description" });
    await userEvent.type(input, "Scope and intent.");
    await expect(input).toHaveValue("Scope and intent.");
  },
};

export const Error: S = {
  args: { validate: (v: string) => (v.length < 3 ? "Too short." : true) },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const input = c.getByRole("textbox", { name: "Description" });
    await userEvent.type(input, "ab");
    await userEvent.tab();
    await expect(c.getByRole("alert")).toHaveTextContent("Too short.");
  },
};

export const Disabled: S = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("textbox", { name: "Description" })).toBeDisabled();
  },
};

export const WithHelp: S = { args: { help: "Explain the scope and intent of the inquiry." } };

export const Optional: S = { args: { marker: "optional" } };

export const Rows12: S = { args: { rows: 12 } };
