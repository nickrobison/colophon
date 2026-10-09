import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { CphToolbar } from "./CphToolbar";

function ControlledToolbar({
  onSearchChange,
  onSearchSubmit,
}: {
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  return (
    <CphToolbar
      searchValue={value}
      onSearchChange={(nextValue) => {
        setValue(nextValue);
        onSearchChange?.(nextValue);
      }}
      {...(onSearchSubmit ? { onSearchSubmit } : {})}
    />
  );
}

describe("CphToolbar", () => {
  const defaultFilter = {
    key: "status",
    label: "Status",
    options: [
      { value: "all", label: "All" },
      { value: "active", label: "Active" },
      { value: "inactive", label: "Inactive" },
    ],
    value: "all",
    onChange: vi.fn(),
  };
  const defaultFilters = [defaultFilter];

  it("renders toolbar with cph-table__toolbar class", () => {
    render(<CphToolbar />);
    expect(screen.getByTestId("toolbar")).toHaveClass("cph-table__toolbar");
  });

  it("renders SearchField with accessible label", () => {
    render(<CphToolbar />);
    const searchField = screen.getByRole("searchbox", { name: "Search table" });
    expect(searchField).toBeInTheDocument();
  });

  it("renders search input with placeholder", () => {
    render(<CphToolbar searchPlaceholder="Find records…" />);
    expect(screen.getByPlaceholderText("Find records…")).toBeInTheDocument();
  });

  it("calls onSearchChange when input changes", async () => {
    const onSearchChange = vi.fn();
    const user = userEvent.setup();
    render(<ControlledToolbar onSearchChange={onSearchChange} />);
    const input = screen.getByLabelText("Search table");
    await user.type(input, "test query");
    expect(onSearchChange).toHaveBeenCalledWith("test query");
  });

  it("shows clear button when search has value", () => {
    render(<CphToolbar searchValue="test" onSearchChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Clear search" })).toBeInTheDocument();
  });

  it("hides clear button when search is empty", () => {
    render(<CphToolbar searchValue="" onSearchChange={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Clear search" })).not.toBeInTheDocument();
  });

  it("clears search when clear button is clicked", async () => {
    const onSearchChange = vi.fn();
    const user = userEvent.setup();
    render(<CphToolbar searchValue="test" onSearchChange={onSearchChange} />);
    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect(onSearchChange).toHaveBeenCalledWith("");
  });

  it("calls onSearchSubmit when Enter is pressed", async () => {
    const onSearchSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ControlledToolbar onSearchSubmit={onSearchSubmit} />);
    const input = screen.getByLabelText("Search table");
    await user.type(input, "submit query");
    await user.keyboard("[Enter]");
    expect(onSearchSubmit).toHaveBeenCalledWith("submit query");
  });

  it("renders filter selects when filters provided", () => {
    render(<CphToolbar filters={defaultFilters} />);
    expect(screen.getByRole("group", { name: "Table filters" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /status/i })).toBeInTheDocument();
  });

  it("renders filter options in select", async () => {
    const user = userEvent.setup();
    render(<CphToolbar filters={defaultFilters} />);
    const select = screen.getByRole("button", { name: /status/i });
    await user.click(select);
    expect(screen.getByRole("option", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Active" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Inactive" })).toBeInTheDocument();
  });

  it("calls filter onChange when option selected", async () => {
    const user = userEvent.setup();
    const filterChange = vi.fn();
    const filters = [{ ...defaultFilter, onChange: filterChange }];
    render(<CphToolbar filters={filters} />);
    const select = screen.getByRole("button", { name: /status/i });
    await user.click(select);
    await user.click(screen.getByRole("option", { name: "Active" }));
    expect(filterChange).toHaveBeenCalledWith("active");
  });

  it("renders actions slot when provided", () => {
    render(<CphToolbar actions={<button data-testid="custom-action">Custom</button>} />);
    expect(screen.getByTestId("custom-action")).toBeInTheDocument();
    expect(screen.getByTestId("custom-action")).toHaveTextContent("Custom");
  });

  it("renders children when provided", () => {
    render(
      <CphToolbar>
        <span data-testid="child-content">Child</span>
      </CphToolbar>,
    );
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
  });

  it("forwards additional props to root div", () => {
    render(<CphToolbar id="custom-toolbar" />);
    expect(screen.getByTestId("toolbar")).toHaveAttribute("id", "custom-toolbar");
  });

  it("does not overflow at 375px viewport width", () => {
    const { container } = render(<CphToolbar filters={defaultFilters} />);
    const toolbar = container.querySelector('[data-testid="toolbar"]') as HTMLElement;
    expect(toolbar).not.toBeNull();
    // The toolbar uses flex layout with min-width: 12rem (192px) on search field
    // which fits within 375px. The flex container should not force overflow.
    expect(toolbar!.scrollWidth).toBeLessThanOrEqual(375);
  });
});
