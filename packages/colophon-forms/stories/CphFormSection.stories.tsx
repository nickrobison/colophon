import type { Meta, StoryObj } from "@storybook/react";

import { CphField, CphFormSection } from "../src";

const meta: Meta<typeof CphFormSection> = {
  title: "Colophon/Forms/CphFormSection",
  component: CphFormSection,
  args: { eyebrow: "Contact", title: "Your details" },
};
export default meta;
type S = StoryObj<typeof CphFormSection>;

export const Default: S = {
  args: { children: <CphField label="Full name" name="name" /> },
};

export const WithDescription: S = {
  args: {
    description: "We will use these details only to follow up on your inquiry.",
    children: <CphField label="Email address" name="email" />,
  },
};
