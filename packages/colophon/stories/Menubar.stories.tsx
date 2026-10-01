import type { Meta, StoryObj } from "@storybook/react";

import { CphMenubar } from "../src/components/Nav/Menubar";
const items = [
  { id: "file", label: "File", icon: "book" as const },
  { id: "edit", label: "Edit" },
  { id: "view", label: "View" },
  { id: "grid", label: "Grid", icon: "grid" as const },
];
const meta: Meta<typeof CphMenubar> = {
  title: "Colophon/Navigation/Menubar",
  component: CphMenubar,
  args: { items, "aria-label": "Application menubar", selectedId: "file" },
};
export default meta;
type S = StoryObj<typeof CphMenubar>;
export const Default: S = {};
