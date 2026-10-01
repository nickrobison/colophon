import type { Meta, StoryObj } from "@storybook/react";
import { CphNavMenu } from "../src/components/Nav/NavMenu";
import type { CphNavItem } from "../src/components/Nav/types";
const items: CphNavItem[] = [
  { id: "overview", label: "Overview", icon: "grid" },
  { id: "explore", label: "Explore", icon: "compass" },
  { id: "collections", label: "Collections", icon: "layers", count: 8 },
  { id: "chronologies", label: "Chronologies", icon: "timeline" },
  { id: "archive", label: "Archive", icon: "archive" },
];
const meta: Meta<typeof CphNavMenu> = { title: "Colophon/Navigation/NavMenu", component: CphNavMenu, args: { items, "aria-label": "Workspace", selectedId: "overview" } };
export default meta;
type S = StoryObj<typeof CphNavMenu>;
export const Default: S = { render: (a) => (<div className="cph-sidebar" style={{ position: "static", width: "15.5rem", height: "auto" }}><div className="cph-nav" style={{ padding: 0 }}><CphNavMenu {...a} /></div></div>) };
