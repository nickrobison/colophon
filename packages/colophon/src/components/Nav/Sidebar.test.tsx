import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CphSidebar } from "./Sidebar";
const base = {
  brand: { mark: "K", name: "Kepler", subtitle: "Knowledge Systems" },
  sectionTitle: "Workspace",
  navItems: [
    { id: "overview", label: "Overview", icon: "grid" as const },
    { id: "explore", label: "Explore", icon: "compass" as const },
  ],
  note: { index: "Nº 04", quote: "Knowledge is a network.", caption: "Current research principle" },
  profile: { initials: "AM", name: "Dr. Ada Mercer", role: "Research Fellow" },
};
describe("CphSidebar", () => {
  it("renders brand, nav, note and profile", () => {
    render(<CphSidebar {...base} />);
    expect(screen.getByText("Kepler")).toBeVisible();
    expect(screen.getByText("Knowledge Systems")).toBeVisible();
    expect(screen.getByText("Knowledge is a network.")).toBeVisible();
    expect(screen.getByText("Dr. Ada Mercer")).toBeVisible();
  });
  it("selects a nav item", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<CphSidebar {...base} onSelect={onSelect} />);
    await user.click(screen.getByRole("option", { name: /Explore/ }));
    expect(onSelect).toHaveBeenCalledWith("explore");
  });
});
