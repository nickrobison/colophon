import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CphMenubar } from "./Menubar";
const items = [{ id: "file", label: "File" }, { id: "edit", label: "Edit" }, { id: "view", label: "View" }];
describe("CphMenubar", () => {
  it("renders tabs and reports selection", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<CphMenubar items={items} aria-label="Application menubar" onSelect={onSelect} />);
    await user.click(screen.getByRole("tab", { name: "Edit" }));
    expect(onSelect).toHaveBeenCalledWith("edit");
  });
  it("supports arrow-key navigation", async () => {
    const user = userEvent.setup();
    render(<CphMenubar items={items} aria-label="Application menubar" />);
    await user.tab();
    expect(screen.getByRole("tab", { name: "File" })).toHaveFocus();
  });
});
