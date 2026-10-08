import type { Meta, StoryObj } from "@storybook/react";
import { CphTableRow } from "../src/components/TableRow/CphTableRow";

const meta: Meta<typeof CphTableRow> = {
  title: "Components/CphTableRow",
  component: CphTableRow,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof CphTableRow>;
export const Default: Story = { args: { children: "Row content" } };
