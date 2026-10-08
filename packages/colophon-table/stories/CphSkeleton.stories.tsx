import type { Meta, StoryObj } from "@storybook/react";

import { CphSkeleton } from "../src/components/CphSkeleton";
const meta: Meta<typeof CphSkeleton> = {
  title: "Components/CphSkeleton",
  component: CphSkeleton,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof CphSkeleton>;
export const Default: Story = { args: { density: "compact" } };
