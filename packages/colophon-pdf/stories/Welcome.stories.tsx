import { CphButton } from "@nickrobison/colophon";
import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof CphButton> = {
  title: "Colophon PDF/Welcome",
  component: CphButton,
};

export default meta;
type Story = StoryObj<typeof CphButton>;

export const Welcome: Story = {
  args: {
    children: "Welcome to the PDF package",
  },
};
