import type { Meta, StoryObj } from "@storybook/react";
import { CphTableHead } from "../src/components/TableHead/CphTableHead";

const meta: Meta<typeof CphTableHead> = {
  title: "Components/CphTableHead",
  component: CphTableHead,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof CphTableHead>;
export const Default: Story = { args: { children: "Header" } };
