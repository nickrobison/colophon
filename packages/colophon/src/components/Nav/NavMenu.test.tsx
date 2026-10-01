import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CphNavMenu } from "./NavMenu";
import type { CphNavItem } from "./types";
const items: CphNavItem[] = [
  { id: "overview", label: "Overview", icon: "grid" },
  { id: "collections", label: "Collections", icon: "layers", count: 8 },
];
describe("CphNavMenu", () => {
  it("renders every nav item with accessible names", () => {
    render(<CphNavMenu items={items} aria-label="Workspace" />);
    expect(screen.getByRole("option", { name: /Overview/ })).toBeVisible();
    expect(screen.getByRole("option", { name: /Collections/ })).toBeVisible();
  });
  it("shows the count badge when provided", () => {
    render(<CphNavMenu items={items} aria-label="Workspace" />);
    expect(screen.getByText("8")).toBeVisible();
  });
  it("calls onSelect on selection", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<CphNavMenu items={items} aria-label="Workspace" onSelect={onSelect} />);
    await user.click(screen.getByRole("option", { name: /Collections/ }));
    expect(onSelect).toHaveBeenCalledWith("collections");
  });
  it("marks the selected item", () => {
    render(<CphNavMenu items={items} aria-label="Workspace" selectedId="overview" />);
    expect(screen.getByRole("option", { name: /Overview/ })).toHaveAttribute("aria-selected", "true");
  });
});
