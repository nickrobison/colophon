import type { Meta, StoryObj } from "@storybook/react";

import { CphMeter } from "../src/components/Meter/Meter";

const meta: Meta<typeof CphMeter> = { title: "Colophon/Meter", component: CphMeter };
export default meta;

export const Positive: StoryObj<typeof CphMeter> = {
  args: { value: 2.3, suffix: "pts", label: "Coding Index" },
};

export const Negative: StoryObj<typeof CphMeter> = {
  args: { value: -1.2, suffix: "pts", label: "Coding Index" },
};

export const Neutral: StoryObj<typeof CphMeter> = {
  args: { value: 0, label: "Unchanged" },
};

export const Compact: StoryObj<typeof CphMeter> = {
  args: { value: 4.1, suffix: "pts", label: "Delta", compact: true },
};

export const Overflow: StoryObj<typeof CphMeter> = {
  args: { value: 25, max: 20, label: "Capped" },
};
