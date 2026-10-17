import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CphDialog } from "./CphDialog";

describe("CphDialog", () => {
  it("opens via trigger click and closes via close button", async () => {
    const user = userEvent.setup();
    render(
      <CphDialog title="Confirm" trigger={<button>Open</button>}>
        <p>Body content</p>
      </CphDialog>,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Confirm")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes on Escape and calls onOpenChange and onClose", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onClose = vi.fn();
    render(
      <CphDialog
        title="T"
        isOpen={true}
        onOpenChange={onOpenChange}
        onClose={onClose}
        trigger={<button>Open</button>}
      />,
    );
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on overlay click and calls onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<CphDialog title="T" isOpen={true} onClose={onClose} trigger={<button>Open</button>} />);
    const overlay = document.querySelector(".cph-dialog-overlay");
    expect(overlay).not.toBeNull();
    await user.click(overlay as Element);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("traps focus inside the dialog while open", async () => {
    const user = userEvent.setup();
    render(
      <CphDialog title="T" trigger={<button>Open</button>}>
        <button>In dialog</button>
      </CphDialog>,
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("links description via aria-describedby and title via aria-labelledby", () => {
    render(
      <CphDialog
        title="My title"
        description="My description"
        isOpen={true}
        trigger={<button>Open</button>}
      />,
    );
    const dialog = screen.getByRole("dialog");
    const labelledBy = dialog.getAttribute("aria-labelledby");
    const describedBy = dialog.getAttribute("aria-describedby");
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy as string)?.textContent).toContain("My title");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy as string)?.textContent).toBe("My description");
  });

  it("locks body scroll while open and restores on close", async () => {
    const user = userEvent.setup();
    render(
      <CphDialog title="T" trigger={<button>Open</button>}>
        <p>Body</p>
      </CphDialog>,
    );
    expect(document.body.style.overflow).not.toBe("hidden");
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(document.body.style.overflow).toBe("hidden");
    await user.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(document.body.style.overflow).not.toBe("hidden");
  });

  it("renders footer content when open", () => {
    render(
      <CphDialog
        title="Title"
        isOpen={true}
        footer={<span>Footer</span>}
        trigger={<button>Open</button>}
      />,
    );
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("supports placement props without errors", () => {
    render(
      <CphDialog
        title="P"
        placement="bottom"
        size="lg"
        isOpen={true}
        trigger={<button>O</button>}
      />,
    );
    expect(screen.getByText("P")).toBeInTheDocument();
    expect(document.querySelector(".cph-dialog--bottom")).not.toBeNull();
  });

  it("exposes aria-label via aria-label prop", () => {
    render(<CphDialog aria-label="My dialog" isOpen={true} trigger={<button>O</button>} />);
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-label", "My dialog");
  });
});
