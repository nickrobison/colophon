import type { RowData, Table } from "@tanstack/react-table";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { CphTableFeatures } from "../../table/features";
import { CphDataTable } from "../DataTable/CphDataTable";
import { PinnedOffsetsContext } from "../DataTable/pinnedOffsets";
import { Cell } from "./Cell";

describe("Cell", () => {
  it("renders a <td> with the cph-table cell data attribute", () => {
    render(<Cell>Content</Cell>);
    const cell = screen.getByRole("cell");
    expect(cell).toHaveAttribute("data-cph-table", "cell");
  });

  it("renders children as cell content", () => {
    render(<Cell>Hello world</Cell>);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("applies data-pinned='start' when pinned is start", () => {
    render(<Cell pinned="start">Pinned</Cell>);
    const cell = screen.getByRole("cell");
    expect(cell).toHaveAttribute("data-pinned", "start");
  });

  it("applies data-pinned='end' when pinned is end", () => {
    render(<Cell pinned="end">Pinned</Cell>);
    const cell = screen.getByRole("cell");
    expect(cell).toHaveAttribute("data-pinned", "end");
  });

  it("omits data-pinned when pinned is undefined", () => {
    render(<Cell pinned={undefined}>Not pinned</Cell>);
    const cell = screen.getByRole("cell");
    expect(cell).not.toHaveAttribute("data-pinned");
  });

  it("applies data-selected='true' when selected is true", () => {
    render(<Cell selected>Selected</Cell>);
    const cell = screen.getByRole("cell");
    expect(cell).toHaveAttribute("data-selected", "true");
  });

  it("omits data-selected when selected is false or undefined", () => {
    render(<Cell selected={false}>Not selected</Cell>);
    const cell = screen.getByRole("cell");
    expect(cell).not.toHaveAttribute("data-selected");
  });

  it("applies data-col-index when colIndex is provided", () => {
    render(<Cell colIndex={2}>Indexed</Cell>);
    const cell = screen.getByRole("cell");
    expect(cell).toHaveAttribute("data-col-index", "2");
  });

  it("omits data-col-index when colIndex is undefined", () => {
    render(<Cell>No index</Cell>);
    const cell = screen.getByRole("cell");
    expect(cell).not.toHaveAttribute("data-col-index");
  });

  it("applies cph-table__pinned class when pinned is start", () => {
    render(<Cell pinned="start">Pinned start</Cell>);
    const cell = screen.getByRole("cell");
    expect(cell).toHaveClass("cph-table__pinned");
  });

  it("applies cph-table__pinned class when pinned is end", () => {
    render(<Cell pinned="end">Pinned end</Cell>);
    const cell = screen.getByRole("cell");
    expect(cell).toHaveClass("cph-table__pinned");
  });

  it("does not apply cph-table__pinned class when not pinned", () => {
    render(<Cell>Not pinned</Cell>);
    const cell = screen.getByRole("cell");
    expect(cell).not.toHaveClass("cph-table__pinned");
  });

  it("applies cph-table__numeric class when numeric is true", () => {
    render(<Cell numeric>12345</Cell>);
    const cell = screen.getByRole("cell");
    expect(cell).toHaveClass("cph-table__numeric");
  });

  it("applies cph-table__numeric class when align is right", () => {
    render(<Cell align="right">12345</Cell>);
    const cell = screen.getByRole("cell");
    expect(cell).toHaveClass("cph-table__numeric");
  });

  it("does not apply cph-table__numeric when numeric is false and align is left", () => {
    render(
      <Cell numeric={false} align="left">
        Text
      </Cell>,
    );
    const cell = screen.getByRole("cell");
    expect(cell).not.toHaveClass("cph-table__numeric");
  });

  it("applies cph-table__truncate class when truncate is true", () => {
    render(<Cell truncate>Very long text that should truncate</Cell>);
    const cell = screen.getByRole("cell");
    expect(cell).toHaveClass("cph-table__truncate");
  });

  it("does not apply cph-table__truncate when truncate is false", () => {
    render(<Cell truncate={false}>Short</Cell>);
    const cell = screen.getByRole("cell");
    expect(cell).not.toHaveClass("cph-table__truncate");
  });

  it("forwards extra className without losing component classes", () => {
    render(
      <Cell className="cph-test-custom-class" numeric>
        Content
      </Cell>,
    );
    const cell = screen.getByRole("cell");
    expect(cell).toHaveClass("cph-table__numeric");
    expect(cell).toHaveClass("cph-test-custom-class");
  });

  it("forwards arbitrary props (e.g., data-testid) to the <td>", () => {
    render(<Cell data-testid="my-cell">Content</Cell>);
    const cell = screen.getByRole("cell");
    expect(cell).toHaveAttribute("data-testid", "my-cell");
  });

  it("combines pinned, numeric, and truncate classes together", () => {
    render(
      <Cell pinned="start" numeric truncate>
        Pinned numeric truncated
      </Cell>,
    );
    const cell = screen.getByRole("cell");
    expect(cell).toHaveClass("cph-table__pinned");
    expect(cell).toHaveClass("cph-table__numeric");
    expect(cell).toHaveClass("cph-table__truncate");
  });

  describe("structural preconditions for row-background indirection", () => {
    it("pinned cell has cph-table__pinned class AND sits inside a cph-table__row ancestor", () => {
      // This test asserts the DOM structure that makes the CSS indirection work:
      // .cph-table__row .cph-table__pinned { background: var(--cph-table-row-bg); }
      // The pinned cell MUST be a descendant of an element with cph-table__row class.
      // jsdom does not compute styles, so we assert the structural precondition.
      // Visual verification of resolved background colour is done in Playwright.
      const { container } = render(
        <table>
          <tbody>
            <tr className="cph-table__row" data-cph-table="row">
              <Cell pinned="start">Pinned cell</Cell>
              <Cell>Regular cell</Cell>
            </tr>
          </tbody>
        </table>,
      );

      const pinnedCell = container.querySelector('[data-cph-table="cell"][data-pinned="start"]');
      expect(pinnedCell).not.toBeNull();
      expect(pinnedCell).toHaveClass("cph-table__pinned");

      const rowAncestor = pinnedCell?.closest(".cph-table__row");
      expect(rowAncestor).not.toBeNull();
      expect(rowAncestor).toHaveClass("cph-table__row");
    });

    it("selected row with pinned cell has data-selected on row AND cph-table__pinned on cell", () => {
      // This structure enables the CSS rule:
      // .cph-table__row[data-selected="true"] .cph-table__pinned { box-shadow: inset 3px 0 var(--cph-orange); }
      // jsdom does not compute box-shadow; structural assertion only.
      const { container } = render(
        <table>
          <tbody>
            <tr className="cph-table__row" data-cph-table="row" data-selected="true">
              <Cell pinned="start" selected>
                Selected pinned
              </Cell>
              <Cell selected>Selected regular</Cell>
            </tr>
          </tbody>
        </table>,
      );

      const row = container.querySelector(".cph-table__row[data-selected='true']");
      expect(row).not.toBeNull();

      const pinnedCell = container.querySelector('[data-cph-table="cell"][data-pinned="start"]');
      expect(pinnedCell).not.toBeNull();
      expect(pinnedCell).toHaveClass("cph-table__pinned");

      // The pinned cell must be a descendant of the selected row
      expect(row?.contains(pinnedCell)).toBe(true);
    });

    it("hovered row structure enables --cph-table-row-bg override for pinned cell", () => {
      // CSS: .cph-table__row:hover { --cph-table-row-bg: var(--cph-table-hover); }
      //      .cph-table__row .cph-table__pinned { background: var(--cph-table-row-bg); }
      // The pinned cell inherits the row's custom property via the descendant selector.
      // jsdom does not evaluate :hover or custom properties; structural assertion only.
      const { container } = render(
        <table>
          <tbody>
            <tr className="cph-table__row" data-cph-table="row">
              <Cell pinned="start">Pinned on hover</Cell>
            </tr>
          </tbody>
        </table>,
      );

      const row = container.querySelector(".cph-table__row");
      expect(row).not.toBeNull();

      const pinnedCell = container.querySelector('[data-cph-table="cell"][data-pinned="start"]');
      expect(pinnedCell).not.toBeNull();
      expect(pinnedCell).toHaveClass("cph-table__pinned");

      // The pinned cell is a descendant of .cph-table__row, so it will read
      // var(--cph-table-row-bg) which the row overrides on :hover
      expect(row?.contains(pinnedCell)).toBe(true);
    });
  });

  describe("pinned offsets from table context", () => {
    function pinHeader(
      id: string,
      size: number,
      isPinned: "start" | "end" | false,
      isLast: boolean,
    ) {
      return {
        id,
        getSize: vi.fn(() => size),
        column: {
          getIsPinned: vi.fn(() => isPinned),
          getIsLastColumn: vi.fn(() => isLast),
        },
      };
    }

    function pinTable() {
      return {
        getStartLeafHeaders: vi.fn(() => [
          pinHeader("a", 100, "start", false),
          pinHeader("b", 120, "start", true),
        ]),
        getEndLeafHeaders: vi.fn(() => [pinHeader("z", 90, "end", true)]),
        getStartVisibleLeafColumns: vi.fn(() => []),
        getCenterVisibleLeafColumns: vi.fn(() => []),
        getEndVisibleLeafColumns: vi.fn(() => []),
      } as unknown as Table<CphTableFeatures, RowData>;
    }

    function renderCell(columnId: string | undefined, pinned: "start" | "end" | undefined) {
      render(
        <CphDataTable table={pinTable()}>
          <tbody>
            <tr>
              <Cell columnId={columnId} pinned={pinned}>
                Pinned
              </Cell>
            </tr>
          </tbody>
        </CphDataTable>,
      );
      return screen.getByText("Pinned").closest("td");
    }

    it("applies the accumulated left offset for start-pinned cells", () => {
      expect(renderCell("b", "start")).toHaveStyle({ left: "100px" });
    });

    it("applies right offset with auto left for end-pinned cells", () => {
      const cell = renderCell("z", "end");
      expect(cell).toHaveStyle({ left: "auto", right: "0px" });
    });

    it("renders no inline offset without a columnId", () => {
      expect(renderCell(undefined, "start")).not.toHaveAttribute("style");
    });

    it("falls back to zero right offset for sparse entries", () => {
      render(
        <PinnedOffsetsContext.Provider
          value={{ offsets: new Map([["z", { left: 0, isLast: true }]]) }}
        >
          <table>
            <tbody>
              <tr>
                <Cell columnId="z" pinned="end">
                  Pinned
                </Cell>
              </tr>
            </tbody>
          </table>
        </PinnedOffsetsContext.Provider>,
      );
      expect(screen.getByText("Pinned").closest("td")).toHaveStyle({
        left: "auto",
        right: "0px",
      });
    });
  });
});
