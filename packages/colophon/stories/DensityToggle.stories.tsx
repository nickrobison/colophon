import type { Meta, StoryObj } from "@storybook/react";

import { CphDensityToggle, CphThemeToggle } from "../src/components/DensityToggle/DensityToggle";
const meta: Meta<typeof CphDensityToggle> = {
  title: "Colophon/DensityToggle",
  component: CphDensityToggle,
};
export default meta;
type S = StoryObj<typeof CphDensityToggle>;
export const Default: S = { render: () => <CphDensityToggle /> };
export const WithThemeToggle: S = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <CphDensityToggle />
      <CphThemeToggle />
    </div>
  ),
};
