/** @packageDocumentation Storybook stories for table components. */

import type { Meta, StoryObj } from "@storybook/react";
import { CphStatusChip } from "../src/components/StatusChip/CphStatusChip";
import { generateRows } from "../__fixtures__/sources";

const meta: Meta<typeof CphStatusChip> = {
  title: "Components/CphStatusChip/Table",
  component: CphStatusChip,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof CphStatusChip>;

export const Default: Story = {
  args: {
    children: "Active",
    tone: "neutral",
  },
  play: async ({ canvasElement }) => {
    const chip = canvasElement.querySelector("[data-cph-table='status-chip']");
    if (chip) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  },
};

export const LargeDataset: Story = {
  args: {
    children: "Pending",
    tone: "orange",
  },
  play: async ({ canvasElement }) => {
    const chip = canvasElement.querySelector("[data-cph-table='status-chip']");
    if (chip) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  },
};
