import type { Meta, StoryObj } from "@storybook/react";

import { CphFormActions } from "../src";

const meta: Meta<typeof CphFormActions> = {
  title: "Colophon/Forms/CphFormActions",
  component: CphFormActions,
  args: { isDirty: false },
};
export default meta;
type S = StoryObj<typeof CphFormActions>;

export const Clean: S = { args: { isDirty: false } };

export const Dirty: S = { args: { isDirty: true } };

export const Submitting: S = { args: { isDirty: true, isSubmitting: true } };

export const WithDiscard: S = {
  args: { isDirty: true, onDiscard: () => {} },
};
