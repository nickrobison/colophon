import type { Meta, StoryObj } from "@storybook/react";
import { CphSidebar } from "../src/components/Nav/Sidebar";
const meta: Meta<typeof CphSidebar> = {
  title: "Colophon/Navigation/Sidebar",
  component: CphSidebar,
  args: {
    brand: { mark: "K", name: "Kepler", subtitle: "Knowledge Systems" },
    sectionTitle: "Workspace",
    navItems: [
      { id: "overview", label: "Overview", icon: "grid" },
      { id: "explore", label: "Explore", icon: "compass" },
      { id: "collections", label: "Collections", icon: "layers", count: 8 },
      { id: "chronologies", label: "Chronologies", icon: "timeline" },
      { id: "archive", label: "Archive", icon: "archive" },
    ],
    note: { index: "Nº 04", quote: "Knowledge is a network, not a filing cabinet.", caption: "Current research principle" },
    profile: { initials: "AM", name: "Dr. Ada Mercer", role: "Research Fellow" },
    defaultSelectedId: "overview",
  },
};
export default meta;
type S = StoryObj<typeof CphSidebar>;
export const Default: S = { render: (a) => (<div className="cph-sidebar" style={{ position: "static", height: "40rem" }}><CphSidebar {...a} /></div>) };
