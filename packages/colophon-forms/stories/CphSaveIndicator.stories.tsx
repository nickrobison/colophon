import type { Meta, StoryObj } from "@storybook/react";

import { CphSaveIndicator } from "../src";

const meta: Meta<typeof CphSaveIndicator> = {
  title: "Colophon/Forms/CphSaveIndicator",
  component: CphSaveIndicator,
  args: { state: "idle" },
};
export default meta;
type S = StoryObj<typeof CphSaveIndicator>;

export const Idle: S = { args: { state: "idle" } };

export const Saving: S = { args: { state: "saving" } };

export const Saved: S = { args: { state: "saved" } };

export const Error: S = { args: { state: "error", errorMessage: "Could not save. Please try again." } };
