import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CphBottomNav } from "./BottomNav";
const items = [{ id: "overview", label: "Overview" }, { id: "explore", label: "Explore" }];
describe("CphBottomNav", () => {
  it("keeps visible text labels under icons", () => {
    render(<CphBottomNav items={items} aria-label="Primary navigation" />);
    expect(screen.getByText("Overview")).toBeVisible();
    expect(screen.getByText("Explore")).toBeVisible();
  });
  it("reports selection", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<CphBottomNav items={items} aria-label="Primary navigation" onSelect={onSelect} />);
    await user.click(screen.getByRole("option", { name: "Explore" }));
    expect(onSelect).toHaveBeenCalledWith("explore");
  });
});
