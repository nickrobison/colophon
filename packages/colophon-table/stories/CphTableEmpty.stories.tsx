import type { Meta, StoryObj } from "@storybook/react";

import { CphTableEmpty } from "../src/components/CphTableEmpty";
const meta: Meta<typeof CphTableEmpty> = {
  title: "Components/CphTableEmpty",
  component: CphTableEmpty,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof CphTableEmpty>;
export const Default: Story = { args: { message: "No data" } };
