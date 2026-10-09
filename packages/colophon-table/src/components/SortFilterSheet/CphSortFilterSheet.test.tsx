import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CphSortFilterSheet } from "./CphSortFilterSheet";

describe("CphSortFilterSheet", () => {
  const defaultProps = {
    children: <div data-testid="sheet-content">Sheet content</div>,
    trigger: <button data-testid="trigger">Open Sheet</button>,
  };

  it("renders trigger element", () => {
    render(<CphSortFilterSheet {...defaultProps} />);
    expect(screen.getByTestId("trigger")).toBeInTheDocument();
  });

  it("opens sheet when trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<CphSortFilterSheet {...defaultProps} />);
    await user.click(screen.getByTestId("trigger"));
    expect(screen.getByTestId("sort-filter-sheet")).toBeInTheDocument();
  });

  it("sheet has aria-modal=true when open", async () => {
    const user = userEvent.setup();
    render(<CphSortFilterSheet {...defaultProps} />);
    await user.click(screen.getByTestId("trigger"));
    const sheet = screen.getByTestId("sort-filter-sheet");
    // React Aria Components places aria-modal on Modal and role=dialog on Dialog.
    expect(screen.getByTestId("sort-filter-sheet-modal")).toHaveAttribute("aria-modal", "true");
    expect(sheet).toHaveAttribute("role", "dialog");
  });

  it("closes sheet when close button is clicked", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<CphSortFilterSheet {...defaultProps} onOpenChange={onOpenChange} />);
    await user.click(screen.getByTestId("trigger"));
    await user.click(screen.getByRole("button", { name: "Close sort & filter" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes sheet when Done button is clicked", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<CphSortFilterSheet {...defaultProps} onOpenChange={onOpenChange} />);
    await user.click(screen.getByTestId("trigger"));
    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes sheet on Escape key", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<CphSortFilterSheet {...defaultProps} onOpenChange={onOpenChange} />);
    await user.click(screen.getByTestId("trigger"));
    await user.keyboard("[Escape]");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders title in heading", async () => {
    const user = userEvent.setup();
    render(<CphSortFilterSheet {...defaultProps} title="Custom Title" />);
    await user.click(screen.getByTestId("trigger"));
    expect(screen.getByRole("heading", { name: "Custom Title" })).toBeInTheDocument();
  });

  it("renders description when provided", async () => {
    const user = userEvent.setup();
    render(
      <CphSortFilterSheet {...defaultProps} description="Manage sorting and filtering options" />,
    );
    await user.click(screen.getByTestId("trigger"));
    expect(screen.getByText("Manage sorting and filtering options")).toBeInTheDocument();
  });

  it("renders children content", async () => {
    const user = userEvent.setup();
    render(<CphSortFilterSheet {...defaultProps} />);
    await user.click(screen.getByTestId("trigger"));
    expect(screen.getByTestId("sheet-content")).toBeInTheDocument();
  });

  it("applies cph-table__sheet class", async () => {
    const user = userEvent.setup();
    render(<CphSortFilterSheet {...defaultProps} />);
    await user.click(screen.getByTestId("trigger"));
    expect(screen.getByTestId("sort-filter-sheet")).toHaveClass("cph-table__sheet");
  });

  it("forwards additional props to dialog", async () => {
    const user = userEvent.setup();
    render(<CphSortFilterSheet {...defaultProps} id="custom-sheet" />);
    await user.click(screen.getByTestId("trigger"));
    expect(screen.getByTestId("sort-filter-sheet")).toHaveAttribute("id", "custom-sheet");
  });

  it("uses controlled isOpen prop", async () => {
    render(<CphSortFilterSheet {...defaultProps} isOpen={true} />);
    expect(screen.getByTestId("sort-filter-sheet")).toBeInTheDocument();
  });

  it("uses uncontrolled defaultOpen prop", async () => {
    render(<CphSortFilterSheet {...defaultProps} defaultOpen={true} />);
    expect(screen.getByTestId("sort-filter-sheet")).toBeInTheDocument();
  });

  it("does not render sheet when closed", () => {
    render(<CphSortFilterSheet {...defaultProps} isOpen={false} />);
    expect(screen.queryByTestId("sort-filter-sheet")).not.toBeInTheDocument();
  });

  it("forwards consumer data attributes and style to the dialog", () => {
    render(
      <CphSortFilterSheet
        {...defaultProps}
        isOpen={true}
        data-track="sheet"
        style={{ zIndex: 7 }}
        aria-label="Custom sheet"
      >
        <div data-testid="sheet-content">Sheet content</div>
      </CphSortFilterSheet>,
    );
    const sheet = screen.getByTestId("sort-filter-sheet");
    expect(sheet).toHaveAttribute("data-track", "sheet");
    expect(sheet).toHaveAttribute("aria-label", "Custom sheet");
    expect(sheet).toHaveStyle({ zIndex: "7" });
  });

  it("generates unique title ids for multiple sheets", () => {
    render(
      <>
        <CphSortFilterSheet isOpen={true} description="First sheet">
          <div>First</div>
        </CphSortFilterSheet>
        <CphSortFilterSheet isOpen={true} description="Second sheet">
          <div>Second</div>
        </CphSortFilterSheet>
      </>,
    );
    const sheets = screen.getAllByTestId("sort-filter-sheet");
    expect(sheets).toHaveLength(2);
    const labelledBy = sheets.map((sheet) => sheet.getAttribute("aria-labelledby"));
    expect(labelledBy[0]).toMatch(/^cph-sort-filter-sheet-title-/);
    expect(labelledBy[1]).toMatch(/^cph-sort-filter-sheet-title-/);
    expect(new Set(labelledBy).size).toBe(2);
    const describedBy = sheets.map((sheet) => sheet.getAttribute("aria-describedby"));
    expect(new Set(describedBy).size).toBe(2);
    for (const id of describedBy) {
      expect(document.getElementById(id ?? "")).toHaveTextContent(/sheet$/i);
    }
  });
});
