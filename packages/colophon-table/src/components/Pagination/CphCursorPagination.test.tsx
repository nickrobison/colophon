import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CphCursorPagination } from "./CphCursorPagination";

describe("CphCursorPagination", () => {
  it("renders the navigation landmark with a label", () => {
    render(<CphCursorPagination />);
    expect(screen.getByRole("navigation", { name: "Table pagination" })).toBeInTheDocument();
  });

  it("applies cph-table__pagination class to the root", () => {
    render(<CphCursorPagination />);
    expect(screen.getByTestId("cursor-pagination")).toHaveClass("cph-table__pagination");
  });

  it("disables Next when there is no next page", () => {
    render(<CphCursorPagination hasNextPage={false} hasPreviousPage={false} />);
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  });

  it("disables navigation while loading", () => {
    render(<CphCursorPagination hasNextPage hasPreviousPage isLoading />);
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  });

  it("calls onNextPage with the end cursor when Next is clicked", async () => {
    const user = userEvent.setup();
    const onNextPage = vi.fn();
    render(<CphCursorPagination hasNextPage endCursor="cursor-2" onNextPage={onNextPage} />);
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(onNextPage).toHaveBeenCalledWith("cursor-2");
  });

  it("calls onPreviousPage with the start cursor when Previous is clicked", async () => {
    const user = userEvent.setup();
    const onPreviousPage = vi.fn();
    render(
      <CphCursorPagination
        hasPreviousPage
        startCursor="cursor-1"
        onPreviousPage={onPreviousPage}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(onPreviousPage).toHaveBeenCalledWith("cursor-1");
  });
});
