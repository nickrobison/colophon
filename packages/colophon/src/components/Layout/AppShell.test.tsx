import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CphAppShell } from "./AppShell";
const sidebar = {
  brand: { mark: "K", name: "Kepler", subtitle: "Knowledge Systems" },
  sectionTitle: "Workspace",
  navItems: [{ id: "overview", label: "Overview", icon: "grid" as const }],
  profile: { initials: "AM", name: "Ada Mercer", role: "Fellow" },
};
describe("CphAppShell", () => {
  it("renders sidebar, content and mobile nav", () => {
    render(<CphAppShell sidebar={sidebar} bottomNav={{ items: sidebar.navItems }}><p>Body</p></CphAppShell>);
    expect(screen.getByText("Kepler")).toBeVisible();
    expect(screen.getByText("Body")).toBeVisible();
    expect(screen.getByRole("listbox", { name: "Primary navigation" })).toBeVisible();
  });
  it("renders top bar actions", () => {
    render(<CphAppShell sidebar={sidebar} topBarActions={<span>Actions</span>}><p>Body</p></CphAppShell>);
    expect(screen.getByText("Actions")).toBeVisible();
  });
});
