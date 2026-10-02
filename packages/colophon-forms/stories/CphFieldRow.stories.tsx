import type { Meta, StoryObj } from "@storybook/react";

import { CphField, CphFieldRow } from "../src";

const meta: Meta<typeof CphFieldRow> = {
  title: "Colophon/Forms/CphFieldRow",
  component: CphFieldRow,
};
export default meta;
type S = StoryObj<typeof CphFieldRow>;

export const Default: S = {
  args: {
    children: [
      <CphField key="first" label="First name" name="firstName" />,
      <CphField key="last" label="Last name" name="lastName" />,
    ],
  },
};
