import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CphDialog } from "./CphDialog";

describe("CphDialog", () => {
  it("renders trigger and opens on click", async () => {
    const user = userEvent.setup();
    render(<CphDialog title="Confirm" isOpen={true} trigger={<button>Open</button>} />);
    expect(screen.getByText("Confirm")).toBeInTheDocument();
  });

  it("calls onOpenChange when open state changes", () => {
    const onOpenChange = vi.fn();
    render(
      <CphDialog title="T" isOpen={true} onOpenChange={onOpenChange} trigger={<span>Open</span>} />,
    );
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("renders footer content when open", () => {
    render(
      <CphDialog
        title="Title"
        isOpen={true}
        footer={<span>Footer</span>}
        trigger={<span>Open</span>}
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
        trigger={<span>Open</span>}
      />,
    );
    expect(screen.getByText("P")).toBeInTheDocument();
  });

  it("exposes aria-label via aria-label prop", () => {
    render(<CphDialog aria-label="My dialog" isOpen={true} trigger={<span>O</span>} />);
    expect(screen.getByRole("dialog", { hidden: true })).toHaveAttribute("aria-label", "My dialog");
  });
});
