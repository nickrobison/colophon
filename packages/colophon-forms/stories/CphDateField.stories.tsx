import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "@storybook/test";

import { CphDateField } from "../src";

const meta: Meta<typeof CphDateField> = {
  title: "Colophon/Forms/CphDateField",
  component: CphDateField,
  args: { label: "Start date" },
};
export default meta;
type S = StoryObj<typeof CphDateField>;

export const Default: S = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const month = c.getByRole("spinbutton", { name: /month/i });
    month.focus();
    await userEvent.keyboard("12152024");

    await waitFor(
      () => {
        expect(c.getByRole("spinbutton", { name: /month/i })).toHaveTextContent("12");
        expect(c.getByRole("spinbutton", { name: /day/i })).toHaveTextContent("15");
        expect(c.getByRole("spinbutton", { name: /year/i })).toHaveTextContent("2024");
        expect(c.getByRole("spinbutton", { name: /month/i })).toHaveAccessibleDescription(
          /Selected Date: December 15, 2024/,
        );
      },
      { timeout: 5000 },
    );
  },
};

export const Focus: S = {
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const month = c.getByRole("spinbutton", { name: /month/i });
    await userEvent.click(month);
    await expect(month).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");
    await expect(c.getByRole("spinbutton", { name: /day/i })).toHaveFocus();
  },
};

export const Error: S = {
  args: { isInvalid: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("alert")).toHaveTextContent("Enter a valid date.");
    await expect(c.getByRole("spinbutton", { name: /month/i })).toHaveAttribute(
      "data-invalid",
      "true",
    );
  },
};

export const Disabled: S = {
  args: { isDisabled: true },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const month = c.getByRole("spinbutton", { name: /month/i });
    await expect(month).toHaveAttribute("data-disabled", "true");
    month.focus();
    await expect(month).not.toHaveFocus();
  },
};

export const WithHelp: S = { args: { help: "Pick the first day of fieldwork." } };

// Play-free twin of Error for the E2E suite: Storybook 8.6 always runs `play` in
// the iframe, so E2E cannot target a story that mutates itself.
export const ErrorE2E: S = { args: { isInvalid: true } };
