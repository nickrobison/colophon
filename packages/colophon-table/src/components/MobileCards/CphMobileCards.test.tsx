import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CphMobileCards, CphMobileCard } from "./CphMobileCards";

describe("CphMobileCards", () => {
  const defaultRows = [
    {
      id: "row-1",
      content: <div data-testid="row-1-content">Row 1 Content</div>,
      secondary: <div data-testid="row-1-secondary">Row 1 Secondary</div>,
      isSelected: false,
    },
    {
      id: "row-2",
      content: <div data-testid="row-2-content">Row 2 Content</div>,
      isSelected: true,
    },
  ];

  it("renders mobile cards container with cph-table__mobile-cards class", () => {
    render(<CphMobileCards rows={defaultRows} />);
    expect(screen.getByTestId("mobile-cards")).toHaveClass("cph-table__mobile-cards");
    expect(screen.getByTestId("mobile-cards")).toHaveAttribute("role", "list");
  });

  it("renders each row as a card", () => {
    render(<CphMobileCards rows={defaultRows} />);
    expect(screen.getByTestId("mobile-card-row-1")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-card-row-2")).toBeInTheDocument();
  });

  it("applies selected state to card", () => {
    render(<CphMobileCards rows={defaultRows} />);
    expect(screen.getByTestId("mobile-card-row-2")).toHaveAttribute("data-selected", "true");
    expect(screen.getByTestId("mobile-card-row-1")).toHaveAttribute("data-selected", "false");
  });

  it("renders checkbox for each card", () => {
    render(<CphMobileCards rows={defaultRows} />);
    expect(screen.getByRole("checkbox", { name: "Select row row-1" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Select row row-2" })).toBeInTheDocument();
  });

  it("calls onSelectionChange when checkbox is toggled", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<CphMobileCards rows={defaultRows} onSelectionChange={onSelectionChange} />);
    await user.click(screen.getByRole("checkbox", { name: "Select row row-1" }));
    expect(onSelectionChange).toHaveBeenCalledWith("row-1", true);
  });

  it("renders row content", () => {
    render(<CphMobileCards rows={defaultRows} />);
    expect(screen.getByTestId("row-1-content")).toBeInTheDocument();
    expect(screen.getByTestId("row-2-content")).toBeInTheDocument();
  });

  it("renders secondary content when provided", () => {
    render(<CphMobileCards rows={defaultRows} />);
    expect(screen.getByTestId("row-1-secondary")).toBeInTheDocument();
  });

  it("uses renderRow function when provided", () => {
    const renderRow = vi.fn((row) => <span data-testid={`custom-${row.id}`}>Custom: {row.id}</span>);
    render(<CphMobileCards rows={defaultRows} renderRow={renderRow} />);
    expect(screen.getByTestId("custom-row-1")).toBeInTheDocument();
    expect(screen.getByTestId("custom-row-2")).toBeInTheDocument();
    expect(renderRow).toHaveBeenCalledTimes(2);
  });

  it("forwards additional props to root div", () => {
    render(<CphMobileCards rows={defaultRows} id="custom-mobile-cards" />);
    expect(screen.getByTestId("mobile-cards")).toHaveAttribute("id", "custom-mobile-cards");
  });

  it("renders children when provided", () => {
    render(
      <CphMobileCards rows={defaultRows}>
        <div data-testid="extra-child">Extra</div>
      </CphMobileCards>,
    );
    expect(screen.getByTestId("extra-child")).toBeInTheDocument();
  });
});

describe("CphMobileCard", () => {
  it("renders card with cph-table__mobile-card class", () => {
    render(<CphMobileCard id="test-card">Content</CphMobileCard>);
    expect(screen.getByTestId("mobile-card-test-card")).toHaveClass("cph-table__mobile-card");
  });

  it("applies selected state", () => {
    render(<CphMobileCard id="test-card" isSelected>Content</CphMobileCard>);
    expect(screen.getByTestId("mobile-card-test-card")).toHaveAttribute("data-selected", "true");
  });

  it("renders checkbox with correct label", () => {
    render(<CphMobileCard id="test-card">Content</CphMobileCard>);
    expect(screen.getByRole("checkbox", { name: "Select row test-card" })).toBeInTheDocument();
  });

  it("calls onSelectionChange when checkbox changes", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(<CphMobileCard id="test-card" onSelectionChange={onSelectionChange}>Content</CphMobileCard>);
    await user.click(screen.getByRole("checkbox", { name: "Select row test-card" }));
    expect(onSelectionChange).toHaveBeenCalledWith("test-card", true);
  });

  it("renders content", () => {
    render(<CphMobileCard id="test-card"><span data-testid="card-content">Card Content</span></CphMobileCard>);
    expect(screen.getByTestId("card-content")).toBeInTheDocument();
  });

  it("renders secondary content when provided", () => {
    render(
      <CphMobileCard id="test-card" secondary={<span data-testid="card-secondary">Secondary</span>}>
        Content
      </CphMobileCard>,
    );
    expect(screen.getByTestId("card-secondary")).toBeInTheDocument();
  });

  it("renders actions when provided", () => {
    render(
      <CphMobileCard id="test-card" actions={<button data-testid="card-action">Action</button>}>
        Content
      </CphMobileCard>,
    );
    expect(screen.getByTestId("card-action")).toBeInTheDocument();
  });
});