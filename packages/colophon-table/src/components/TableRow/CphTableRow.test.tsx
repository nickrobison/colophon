import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CphTableRow } from "./CphTableRow";

describe("CphTableRow", () => {
  it("renders a <tr> with the cph-table row data attribute", () => {
    render(
      <CphTableRow>
        <td>Cell</td>
      </CphTableRow>,
    );
    const row = screen.getByRole("row");
    expect(row).toHaveAttribute("data-cph-table", "row");
  });

  it("forwards children as cell content", () => {
    render(
      <CphTableRow>
        <td>First</td>
        <td>Second</td>
      </CphTableRow>,
    );
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });

  it("applies data-state='selected' when state is selected", () => {
    render(
      <CphTableRow state="selected">
        <td>Cell</td>
      </CphTableRow>,
    );
    const row = screen.getByRole("row");
    expect(row).toHaveAttribute("data-state", "selected");
  });

  it("applies data-state='hovered' when state is hovered", () => {
    render(
      <CphTableRow state="hovered">
        <td>Cell</td>
      </CphTableRow>,
    );
    const row = screen.getByRole("row");
    expect(row).toHaveAttribute("data-state", "hovered");
  });

  it("omits data-state when state is undefined", () => {
    render(
      <CphTableRow state={undefined}>
        <td>Cell</td>
      </CphTableRow>,
    );
    const row = screen.getByRole("row");
    expect(row).not.toHaveAttribute("data-state");
  });

  it("forwards extra className without losing the row attribute", () => {
    render(
      <CphTableRow className="cph-test-custom-class">
        <td>Cell</td>
      </CphTableRow>,
    );
    const row = screen.getByRole("row");
    expect(row).toHaveAttribute("data-cph-table", "row");
    expect(row).toHaveClass("cph-test-custom-class");
  });

  it("forwards arbitrary props (e.g., data-testid) to the <tr>", () => {
    render(
      <CphTableRow data-testid="my-row">
        <td>Cell</td>
      </CphTableRow>,
    );
    const row = screen.getByRole("row");
    expect(row).toHaveAttribute("data-testid", "my-row");
  });

  it("forwards onClick handler to the <tr>", () => {
    const handleClick = vi.fn();
    render(
      <CphTableRow onClick={handleClick}>
        <td>Cell</td>
      </CphTableRow>,
    );
    const row = screen.getByRole("row");
    row.click();
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
