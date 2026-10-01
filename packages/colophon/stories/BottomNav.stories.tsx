import type { Meta, StoryObj } from "@storybook/react";

import { CphBottomNav } from "../src/components/Nav/BottomNav";
import type { CphNavItem } from "../src/components/Nav/types";
const items: CphNavItem[] = [
  { id: "overview", label: "Overview", icon: "grid" },
  { id: "explore", label: "Explore", icon: "compass" },
  { id: "collections", label: "Collections", icon: "layers", count: 8 },
  { id: "archive", label: "Archive", icon: "archive" },
];
const meta: Meta<typeof CphBottomNav> = {
  title: "Colophon/Navigation/BottomNav",
  component: CphBottomNav,
  args: { items, "aria-label": "Primary navigation", selectedId: "overview" },
};
export default meta;
type S = StoryObj<typeof CphBottomNav>;
export const Default: S = {
  render: (a) => (
    <div style={{ position: "relative", height: 120 }}>
      <CphBottomNav {...a} />
    </div>
  ),
};
