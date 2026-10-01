import type { Meta, StoryObj } from "@storybook/react";

import { CphNavMenu } from "../src/components/Nav/NavMenu";
import { CphNavSection } from "../src/components/Nav/NavSection";
const meta: Meta<typeof CphNavSection> = {
  title: "Colophon/Navigation/NavSection",
  component: CphNavSection,
  args: {
    title: "Workspace",
    children: (
      <CphNavMenu
        aria-label="Workspace"
        items={[
          { id: "overview", label: "Overview", icon: "grid" },
          { id: "explore", label: "Explore", icon: "compass" },
        ]}
      />
    ),
  },
};
export default meta;
type S = StoryObj<typeof CphNavSection>;
export const Default: S = {
  render: (a) => (
    <div className="cph-sidebar" style={{ position: "static", width: "15.5rem", height: "auto" }}>
      <div style={{ padding: 0 }}>
        <CphNavSection {...a} />
      </div>
    </div>
  ),
};
export const Collapsed: S = { args: { defaultExpanded: false } };
