import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CphPagination } from "./CphPagination";

describe("CphPagination", () => {
  const defaultProps = {
    currentPage: 2,
    totalPages: 5,
    onPageChange: vi.fn(),
    pageSize: 12 as const,
    onPageSizeChange: vi.fn(),
  };

  it("renders pagination nav landmark", () => {
    render(<CphPagination {...defaultProps} />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
  });

  it("shows current page and total pages", () => {
    render(<CphPagination {...defaultProps} />);
    expect(screen.getByText("Page 2 of 5")).toBeInTheDocument();
  });

  it("disables Previous button on first page", () => {
    render(<CphPagination {...defaultProps} currentPage={1} />);
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
  });

  it("disables Next button on last page", () => {
    render(<CphPagination {...defaultProps} currentPage={5} />);
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });

  it("calls onPageChange when Previous is clicked", async () => {
    const user = userEvent.setup();
    render(<CphPagination {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "Previous page" }));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(1);
  });

  it("calls onPageChange when Next is clicked", async () => {
    const user = userEvent.setup();
    render(<CphPagination {...defaultProps} />);
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(3);
  });

  it("renders page size select with PAGE_SIZES options", () => {
    render(<CphPagination {...defaultProps} />);
    // React Aria Components 1.21.1 exposes Select's trigger as a button, not a combobox.
    const select = screen.getByRole("button", { name: /rows per page/i });
    expect(select).toBeInTheDocument();
    expect(select).toHaveTextContent("12");
  });

  it("calls onPageSizeChange when page size changes", async () => {
    const user = userEvent.setup();
    render(<CphPagination {...defaultProps} />);
    const select = screen.getByRole("button", { name: /rows per page/i });
    await user.click(select);
    await user.click(screen.getByRole("option", { name: "20" }));
    expect(defaultProps.onPageSizeChange).toHaveBeenCalledWith(20);
  });

  it("applies cph-table__pagination class", () => {
    render(<CphPagination {...defaultProps} />);
    expect(screen.getByTestId("pagination")).toHaveClass("cph-table__pagination");
  });

  it("forwards additional props to root div", () => {
    render(<CphPagination {...defaultProps} id="custom-pagination" />);
    expect(screen.getByTestId("pagination")).toHaveAttribute("id", "custom-pagination");
  });
});
