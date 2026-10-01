import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";

import { App } from "./App";

const meta: Meta<typeof App> = {
  title: "Demo/Knowledge Dashboard",
  component: App,
  parameters: { layout: "fullscreen" },
};
export default meta;
type S = StoryObj<typeof App>;

export const Dashboard: S = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Read note" }));
    await expect(canvas.getByText(/The corpus now supports a direct comparison/)).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Table view" }));
    await expect(canvas.getByRole("table")).toBeVisible();
    await userEvent.click(canvas.getByRole("radio", { name: "Dense density" }));
    await expect(canvas.getByRole("listbox", { name: "Primary navigation" })).toBeVisible();
  },
};

export const CardsView: S = { name: "Dashboard / Cards view" };
