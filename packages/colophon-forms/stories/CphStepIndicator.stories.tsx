import type { Meta, StoryObj } from "@storybook/react";

import { CphStepIndicator } from "../src";

const steps = [{ label: "Origin" }, { label: "Details" }, { label: "Review" }];

const meta: Meta<typeof CphStepIndicator> = {
  title: "Colophon/Forms/CphStepIndicator",
  component: CphStepIndicator,
  args: { steps },
};
export default meta;
type S = StoryObj<typeof CphStepIndicator>;

export const FirstStep: S = { args: { current: 0 } };

export const MidFlow: S = { args: { current: 1 } };
