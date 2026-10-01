import type { Meta, StoryObj } from "@storybook/react";

import { CphInsightPanel } from "../src/components/InsightPanel/InsightPanel";
const meta: Meta<typeof CphInsightPanel> = {
  title: "Colophon/InsightPanel",
  component: CphInsightPanel,
  args: {
    title: "An emerging connection",
    brief: "16 citations share vocabulary around order, utility, and observable cause.",
    children: (
      <p>
        References to natural order increasingly bridge your work on Enlightenment epistemology and
        early political economy.
      </p>
    ),
  },
};
export default meta;
type S = StoryObj<typeof CphInsightPanel>;
export const Default: S = {};
export const WithBrief: S = { args: { actionLabel: "Examine 24 connections" } };
