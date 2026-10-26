import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CphDialog } from "./CphDialog";

describe("CphDialog", () => {
  afterEach(() => {
    document.body.style.overflow = "";
  });

  it("labels the dialog from the visible title", () => {
    render(
      <CphDialog isOpen title="Sort options">
        Body
      </CphDialog>,
    );
    const dialog = screen.getByRole("dialog", { name: "Sort options" });
    const heading = screen.getByText("Sort options");
    expect(dialog).toHaveAttribute("aria-labelledby", heading.id);
  });

  it("uses aria-label when no visible title is supplied", () => {
    render(
      <CphDialog isOpen aria-label="Voice memo">
        Body
      </CphDialog>,
    );
    expect(screen.getByRole("dialog", { name: "Voice memo" })).toBeDefined();
  });

  it("wires aria-describedby to the description", () => {
    render(
      <CphDialog isOpen title="Sort options" description="Applied to the ledger">
        Body
      </CphDialog>,
    );
    const dialog = screen.getByRole("dialog", { name: "Sort options" });
    const description = screen.getByText("Applied to the ledger");
    expect(dialog).toHaveAttribute("aria-describedby", description.id);
  });

  it("emits a placement class per preset", () => {
    const placements = ["modal", "bottom", "right", "fullscreen"] as const;
    for (const placement of placements) {
      render(
        <CphDialog isOpen placement={placement} title={`Dialog ${placement}`}>
          Body
        </CphDialog>,
      );
      expect(screen.getByRole("dialog", { name: `Dialog ${placement}` })).toHaveClass(
        `cph-dialog--${placement}`,
      );
    }
  });

  it("renders a size class for the width preset", () => {
    render(
      <CphDialog isOpen size="lg" title="Large dialog">
        Body
      </CphDialog>,
    );
    expect(screen.getByRole("dialog", { name: "Large dialog" })).toHaveClass("cph-dialog--lg");
  });

  it("renders footer content", () => {
    render(
      <CphDialog isOpen title="Confirm" footer={<button>Apply</button>}>
        Body
      </CphDialog>,
    );
    expect(screen.getByRole("button", { name: "Apply" })).toBeInTheDocument();
  });

  it("renders closed when not open", () => {
    render(
      <CphDialog isOpen={false} title="Hidden">
        Body
      </CphDialog>,
    );
    expect(screen.queryByRole("dialog", { name: "Hidden" })).toBeNull();
  });

  it("opens uncontrolled from defaultOpen and closes via the close button", async () => {
    const user = userEvent.setup();
    render(
      <CphDialog defaultOpen title="Minutes">
        Body
      </CphDialog>,
    );
    expect(screen.getByRole("dialog", { name: "Minutes" })).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(screen.queryByRole("dialog", { name: "Minutes" })).toBeNull();
  });

  it("reports Escape dismissal and closes when focus is trapped", () => {
    const onOpenChange = vi.fn();
    const onClose = vi.fn();
    render(
      <CphDialog isOpen onOpenChange={onOpenChange} onClose={onClose} title="Feedback">
        Body
      </CphDialog>,
    );
    fireEvent.keyDown(screen.getByRole("dialog", { name: "Feedback" }), {
      key: "Escape",
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on outside press when focus is trapped", () => {
    const onOpenChange = vi.fn();
    render(
      <CphDialog isOpen onOpenChange={onOpenChange} title="Feedback">
        Body
      </CphDialog>,
    );
    // jsdom lacks PointerEvent, so RAC's interact-outside falls back to
    // mousedown/mouseup listeners in the test environment.
    fireEvent.mouseDown(document.body);
    fireEvent.mouseUp(document.body);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders the modal overlay when focus is trapped by default", () => {
    render(
      <CphDialog isOpen title="Feedback">
        Body
      </CphDialog>,
    );
    expect(document.querySelector(".cph-dialog__overlay")).not.toBeNull();
  });

  it("leaves focus unmanaged when focusTrap is false", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <>
        <CphDialog
          isOpen
          focusTrap={false}
          placement="bottom"
          onOpenChange={onOpenChange}
          title="Bottom sheet"
        >
          Body
        </CphDialog>
        <button>Untrap</button>
      </>,
    );
    expect(document.querySelector(".cph-dialog__overlay")).toBeNull();
    const dialog = screen.getByRole("dialog", { name: "Bottom sheet" });
    expect(dialog.parentElement).toHaveClass("cph-dialog__layer--bottom");

    await user.tab();
    expect(document.activeElement).toHaveAttribute("aria-label", "Close dialog");
    await user.tab();
    expect(document.activeElement?.textContent).toBe("Untrap");
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("keeps Escape working in the non-modal layer", () => {
    const onOpenChange = vi.fn();
    render(
      <CphDialog
        isOpen
        focusTrap={false}
        placement="fullscreen"
        onOpenChange={onOpenChange}
        title="Review"
      >
        Body
      </CphDialog>,
    );
    fireEvent.keyDown(screen.getByRole("dialog", { name: "Review" }), {
      key: "Escape",
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("locks body scroll only in the non-modal path when scrollLock is set", () => {
    const { unmount: unmountTrapped } = render(
      <CphDialog isOpen title="Trapped">
        Body
      </CphDialog>,
    );
    expect(document.body.style.overflow).toBe("");
    unmountTrapped();

    const onOpenChange = vi.fn();
    const { unmount } = render(
      <CphDialog
        isOpen
        focusTrap={false}
        placement="bottom"
        onOpenChange={onOpenChange}
        title="Untrapped"
      >
        Body
      </CphDialog>,
    );
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});
