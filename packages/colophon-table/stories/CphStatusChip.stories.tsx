/** @packageDocumentation Storybook stories for table components. */

import type { Meta, StoryObj } from "@storybook/react";
import { CphStatusChip } from "../src/components/StatusChip/CphStatusChip";

const meta: Meta<typeof CphStatusChip> = {
  title: "Components/CphStatusChip",
  component: CphStatusChip,
  parameters: {
    layout: "centered",
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

export const Orange: Story = {
  args: {
    children: "Pending",
    tone: "orange",
  },
};

export const Sage: Story = {
  args: {
    children: "Complete",
    tone: "sage",
  },
};

export const Error: Story = {
  args: {
    children: "Failed",
    tone: "error",
  },
};
