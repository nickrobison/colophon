import type { Meta, StoryObj } from "@storybook/react";

import { CphButton } from "../src/components/Button/CphButton";
import { CphDensityToggle, CphThemeToggle } from "../src/components/DensityToggle/DensityToggle";
import { CphAppShell } from "../src/components/Layout/AppShell";
import { CphPanel } from "../src/components/Panel/Panel";
import { CphSearch } from "../src/components/Search/Search";
import { CphSignalTile } from "../src/components/SignalTile/SignalTile";
const navItems = [
  { id: "overview", label: "Overview", icon: "grid" as const },
  { id: "explore", label: "Explore", icon: "compass" as const },
  { id: "collections", label: "Collections", icon: "layers" as const, count: 8 },
  { id: "chronologies", label: "Chronologies", icon: "timeline" as const },
  { id: "archive", label: "Archive", icon: "archive" as const },
];
const meta: Meta<typeof CphAppShell> = {
  title: "Colophon/Layout/AppShell",
  component: CphAppShell,
  args: {
    sidebar: {
      brand: { mark: "K", name: "Kepler", subtitle: "Knowledge Systems" },
      sectionTitle: "Workspace",
      navItems,
      note: {
        index: "Nº 04",
        quote: "Knowledge is a network, not a filing cabinet.",
        caption: "Current research principle",
      },
      profile: { initials: "AM", name: "Dr. Ada Mercer", role: "Research Fellow" },
    },
    bottomNav: { items: navItems },
    topBarLeading: <CphSearch />,
    topBarActions: (
      <>
        <CphDensityToggle />
        <CphThemeToggle />
        <CphButton variant="primary">New inquiry</CphButton>
      </>
    ),
    children: <p>Content column.</p>,
  },
};
export default meta;
type S = StoryObj<typeof CphAppShell>;
export const Default: S = {
  render: (a) => (
    <div style={{ height: "40rem", overflow: "hidden" }}>
      <CphAppShell {...a} />
    </div>
  ),
};
export const WithDashboard: S = {
  render: (a) => (
    <div style={{ height: "46rem", overflow: "auto" }}>
      <CphAppShell {...a}>
        <div className="cph-content" style={{ padding: 0 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 1,
              background: "var(--cph-line)",
            }}
          >
            {[
              ["Ⅰ", "12,483", "+8.4%", "Sources indexed"],
              ["Ⅱ", "2,941", "+124", "Active concepts"],
              ["Ⅲ", "38,205", "+12.1%", "Relationships"],
              ["Ⅳ", "17", "3 urgent", "Open inquiries"],
            ].map(([m, v, d, l], i) => (
              <CphSignalTile key={m} mark={m!} value={v!} delta={d!} label={l!} urgent={i === 3} />
            ))}
          </div>
          <div className="cph-dashboard-grid">
            <CphPanel heading={<h2>Concept topology</h2>} footer={<span>10 of 2,941</span>}>
              <p>Graph panel</p>
            </CphPanel>
            <CphPanel heading={<h2>Dominant fields</h2>}>
              <p>Topics panel</p>
            </CphPanel>
          </div>
        </div>
      </CphAppShell>
    </div>
  ),
};
