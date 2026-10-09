/** @packageDocumentation Storybook stories for table components. */

import type { Meta, StoryObj } from "@storybook/react";

import { CphStatusChip } from "../src/components/StatusChip/CphStatusChip";

const meta: Meta<typeof CphStatusChip> = {
  title: "Components/Table/CphTable",
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
};

export const LargeDataset: Story = {
  args: {
    children: "Pending",
    tone: "orange",
  },
};
