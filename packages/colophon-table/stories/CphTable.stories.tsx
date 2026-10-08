/** @packageDocumentation Storybook stories for table components. */

import type { Meta, StoryObj } from "@storybook/react";
import { CphTable } from "../src/components/Table/CphTable";
import { generateRows } from "../__fixtures__/sources";

const meta: Meta<typeof CphTable> = {
  title: "Components/CphTable",
  component: CphTable,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof CphTable>;

export const Default: Story = {
  args: {
    rows: generateRows(8),
  },
  play: async ({ canvasElement }) => {
    const table = canvasElement.querySelector("table");
    if (table) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  },
};

export const LargeDataset: Story = {
  args: {
    rows: generateRows(128),
  },
  play: async ({ canvasElement }) => {
    const table = canvasElement.querySelector("table");
    if (table) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  },
};
