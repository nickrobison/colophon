import type { Meta, StoryObj } from "@storybook/react";

import { CphErrorSummary } from "../src";

const meta: Meta<typeof CphErrorSummary> = {
  title: "Colophon/Forms/CphErrorSummary",
  component: CphErrorSummary,
  args: { errors: [] },
};
export default meta;
type S = StoryObj<typeof CphErrorSummary>;

export const NoErrors: S = { args: { errors: [] } };

export const WithErrors: S = {
  args: {
    errors: [
      { fieldId: "title", message: "Title is required." },
      { fieldId: "email", message: "Enter a valid email address." },
      { fieldId: "body", message: "Description is too short." },
    ],
  },
};
