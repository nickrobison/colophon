import type { Meta, StoryObj } from "@storybook/react";

import { CphIcon, type CphIconName } from "../src/components/Icon/CphIcon";
const names: CphIconName[] = [
  "archive",
  "arrow",
  "book",
  "chevron",
  "compass",
  "grid",
  "layers",
  "list",
  "moon",
  "search",
  "spark",
  "sun",
  "timeline",
];
const meta: Meta<typeof CphIcon> = {
  title: "Colophon/Icon",
  component: CphIcon,
  args: { name: "search" },
};
export default meta;
type S = StoryObj<typeof CphIcon>;
export const Default: S = {};
export const Sizes: S = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      {names.map((n) => (
        <CphIcon key={n} name={n} size={18} aria-label={n} />
      ))}
    </div>
  ),
};
export const Sizes24: S = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      {names.map((n) => (
        <CphIcon key={n} name={n} size={24} aria-label={n} />
      ))}
    </div>
  ),
};
