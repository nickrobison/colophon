/** @packageDocumentation Tests for HeaderCell. */

import type { Table, RowData, ColumnPinningPosition } from "@tanstack/react-table";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import type { CphTableFeatures } from "../../table/features";
import { CphDataTable, usePinnedOffset } from "../DataTable/CphDataTable";
import {
  HeaderCell,
  type HeaderCellColumn,
  type HeaderCellHeader,
  type HeaderCellProps,
} from "./HeaderCell";

// Minimal mock header for testing
function createMockHeader(
  id: string,
  overrides: Partial<{
    isPlaceholder: boolean;
    column: Partial<HeaderCellColumn> & { getSize?: () => number };
  }> = {},
) {
  const { getSize, ...columnOverrides } = overrides.column ?? {};
  const column = createMockColumn(id, columnOverrides);
  return {
    id,
    isPlaceholder: overrides.isPlaceholder ?? false,
    placeholderId: `placeholder-${id}`,
    column,
    getSize: getSize ?? (() => 100),
  } satisfies HeaderCellHeader & { column: HeaderCellColumn; getSize: () => number };
}

// Minimal mock column for testing
function createMockColumn(
  id: string,
  overrides: Partial<{
    getCanSort: () => boolean;
    getIsSorted: () => boolean | "asc" | "desc";
    getSortIndex: () => number;
    getIsPinned: () => ColumnPinningPosition;
    getCanPin: () => boolean;
    getIsLastColumn: (pos?: ColumnPinningPosition | "center") => boolean;
    toggleSorting: () => void;
    pin: (pos: "start" | "end" | false) => void;
  }> = {},
): HeaderCellColumn {
  return {
    getCanSort: overrides.getCanSort ?? vi.fn(() => true),
    getIsSorted: overrides.getIsSorted ?? vi.fn(() => false),
    getSortIndex: overrides.getSortIndex ?? vi.fn(() => 0),
    getIsPinned: overrides.getIsPinned ?? vi.fn((): ColumnPinningPosition => false),
    getCanPin: overrides.getCanPin ?? vi.fn(() => true),
    getIsLastColumn:
      overrides.getIsLastColumn ??
      vi.fn((pos?: ColumnPinningPosition | "center") => (pos === "start" ? false : false)),
    toggleSorting: overrides.toggleSorting ?? vi.fn(),
    pin: overrides.pin ?? vi.fn(),
  };
}

// Minimal mock table for testing - provides all methods CphDataTable needs
function createMockTable() {
  const startLeafHeaders = [createMockHeader("col-1"), createMockHeader("col-2")];
  const startVisibleLeafColumns = [
    { id: "col-1", columnDef: { meta: { widthClass: "source" } } },
    { id: "col-2", columnDef: { meta: { widthClass: "type" } } },
  ];
  const centerVisibleLeafColumns = [
    { id: "col-3", columnDef: { meta: { widthClass: "collection" } } },
  ];
  const endVisibleLeafColumns = [{ id: "col-4", columnDef: { meta: { widthClass: "number" } } }];

  return {
    getStartLeafHeaders: vi.fn(() => startLeafHeaders),
    getStartVisibleLeafColumns: vi.fn(() => startVisibleLeafColumns),
    getCenterVisibleLeafColumns: vi.fn(() => centerVisibleLeafColumns),
    getEndVisibleLeafColumns: vi.fn(() => endVisibleLeafColumns),
  } as unknown as Table<CphTableFeatures, RowData>;
}

// Wrapper component that provides the PinnedOffsetsContext via a real CphDataTable
function HeaderCellWrapper({
  header,
  column,
  label,
  pinned = false,
  canPin = true,
  ...props
}: {
  header: HeaderCellHeader;
  column: HeaderCellColumn;
  label: string;
  pinned?: "start" | "end" | false;
  canPin?: boolean;
  isLastPinned?: boolean;
  sortDirection?: HeaderCellProps["sortDirection"];
} & Omit<
  HeaderCellProps,
  "header" | "column" | "pinned" | "canPin" | "isLastPinned" | "sortDirection" | "children"
>) {
  const table = createMockTable();
  return (
    <CphDataTable table={table}>
      <HeaderCell
        header={header}
        column={column}
        pinned={pinned}
        canPin={canPin}
        isLastPinned={props.isLastPinned ?? false}
        sortDirection={props.sortDirection}
        {...props}
      >
        {label}
      </HeaderCell>
    </CphDataTable>
  );
}

describe("HeaderCell", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("aria-sort attribute", () => {
    it("is ABSENT when unsorted (not 'none')", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1", {
        getIsSorted: vi.fn((): boolean | "asc" | "desc" => false),
      });

      render(
        <HeaderCellWrapper
          header={header}
          column={column}
          canSort={true}
          sortDirection={undefined}
          pinned={false}
          canPin={true}
          isLastPinned={false}
          label="Name"
        />,
      );

      const th = screen.getByRole("columnheader", { name: /name/i });
      expect(th).not.toHaveAttribute("aria-sort");
    });

    it("is 'ascending' when sorted asc", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1", {
        getIsSorted: vi.fn((): boolean | "asc" | "desc" => "asc"),
      });

      render(
        <HeaderCellWrapper
          header={header}
          column={column}
          canSort={true}
          sortDirection="asc"
          pinned={false}
          canPin={true}
          isLastPinned={false}
          label="Name"
        />,
      );

      const th = screen.getByRole("columnheader", { name: /name/i });
      expect(th).toHaveAttribute("aria-sort", "ascending");
    });

    it("is 'descending' when sorted desc", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1", {
        getIsSorted: vi.fn((): boolean | "asc" | "desc" => "desc"),
      });

      render(
        <HeaderCellWrapper
          header={header}
          column={column}
          canSort={true}
          sortDirection="desc"
          pinned={false}
          canPin={true}
          isLastPinned={false}
          label="Name"
        />,
      );

      const th = screen.getByRole("columnheader", { name: /name/i });
      expect(th).toHaveAttribute("aria-sort", "descending");
    });
  });

  describe("sort affordance", () => {
    it("renders a button with cph-table__sort class when canSort is true", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1");

      render(
        <HeaderCellWrapper
          header={header}
          column={column}
          canSort={true}
          sortDirection={undefined}
          pinned={false}
          canPin={true}
          isLastPinned={false}
          label="Name"
        />,
      );

      const button = screen.getByRole("button", { name: /sort ascending/i });
      expect(button).toHaveClass("cph-table__sort");
    });

    it("renders label and arrow-only glyph (no words like 'ascending' in arrow)", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1");

      render(
        <HeaderCellWrapper
          header={header}
          column={column}
          canSort={true}
          sortDirection="asc"
          pinned={false}
          canPin={true}
          isLastPinned={false}
          label="Name"
        />,
      );

      const button = screen.getByRole("button", { name: /sort descending/i });
      expect(button).toHaveTextContent("Name");
      const arrow = button.querySelector(".cph-table__sort-arrow");
      expect(arrow).toBeInTheDocument();
      expect(arrow).toHaveTextContent("▲");
      // Arrow should NOT contain words like "ascending"
      expect(arrow).not.toHaveTextContent(/ascending|descending/i);
    });

    it("shows ▲ for asc, ▼ for desc, empty for unsorted", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1");

      const { rerender } = render(
        <HeaderCellWrapper
          header={header}
          column={column}
          canSort={true}
          sortDirection={undefined}
          label="Name"
        />,
      );
      let arrow = screen
        .getByRole("button", { name: /sort ascending/i })
        .querySelector(".cph-table__sort-arrow");
      expect(arrow).toHaveTextContent("");

      rerender(
        <HeaderCellWrapper
          header={header}
          column={column}
          canSort={true}
          sortDirection="asc"
          label="Name"
        />,
      );
      arrow = screen
        .getByRole("button", { name: /sort descending/i })
        .querySelector(".cph-table__sort-arrow");
      expect(arrow).toHaveTextContent("▲");

      rerender(
        <HeaderCellWrapper
          header={header}
          column={column}
          canSort={true}
          sortDirection="desc"
          label="Name"
        />,
      );
      arrow = screen
        .getByRole("button", { name: /sort ascending/i })
        .querySelector(".cph-table__sort-arrow");
      expect(arrow).toHaveTextContent("▼");
    });

    it("calls column.toggleSorting() on click", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1", {
        toggleSorting: vi.fn(),
      });

      render(
        <HeaderCellWrapper
          header={header}
          column={column}
          canSort={true}
          sortDirection={undefined}
          pinned={false}
          canPin={true}
          isLastPinned={false}
          label="Name"
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: /sort ascending/i }));
      expect(column.toggleSorting).toHaveBeenCalledTimes(1);
    });

    it("renders plain label (no button) when canSort is false", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1", { getCanSort: vi.fn(() => false) });

      render(
        <HeaderCellWrapper
          header={header}
          column={column}
          canSort={false}
          sortDirection={undefined}
          pinned={false}
          canPin={true}
          isLastPinned={false}
          label="Name"
        />,
      );

      expect(screen.queryByRole("button", { name: /sort/i })).not.toBeInTheDocument();
      expect(screen.getByText("Name")).toBeInTheDocument();
    });
  });

  describe("select-all checkbox", () => {
    it("renders checkbox when selectAll prop is provided", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1");

      render(
        <HeaderCellWrapper
          header={header}
          column={column}
          canSort={false}
          sortDirection={undefined}
          pinned={false}
          canPin={true}
          isLastPinned={false}
          selectAll={false}
          label="Name"
        />,
      );

      const checkbox = screen.getByRole<HTMLInputElement>("checkbox", { name: /select all rows/i });
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it("checkbox is checked when selectAll is true", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1");

      render(
        <HeaderCellWrapper
          header={header}
          column={column}
          canSort={false}
          sortDirection={undefined}
          pinned={false}
          canPin={true}
          isLastPinned={false}
          selectAll={true}
          label="Name"
        />,
      );

      const checkbox = screen.getByRole<HTMLInputElement>("checkbox", { name: /select all rows/i });
      expect(checkbox).toBeChecked();
    });

    it("sets indeterminate via ref callback (not prop)", async () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1");

      const { rerender } = render(
        <HeaderCellWrapper
          header={header}
          column={column}
          canSort={false}
          selectAll={true}
          selectAllIndeterminate={true}
          label="Name"
        />,
      );

      const checkbox = screen.getByRole<HTMLInputElement>("checkbox", { name: /select all rows/i });
      // The indeterminate property is set via useEffect, wait for it
      await waitFor(() => expect(checkbox.indeterminate).toBe(true));

      rerender(
        <HeaderCellWrapper
          header={header}
          column={column}
          canSort={false}
          selectAll={true}
          selectAllIndeterminate={false}
          label="Name"
        />,
      );
      await waitFor(() => expect(checkbox.indeterminate).toBe(false));
    });

    it("does not render checkbox when selectAll is undefined", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1");

      render(<HeaderCellWrapper header={header} column={column} canSort={false} label="Name" />);

      expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    });

    it("calls onSelectAllChange with the new checked state when toggled", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1");
      const onSelectAllChange = vi.fn();

      render(
        <HeaderCellWrapper
          header={header}
          column={column}
          canSort={false}
          pinned={false}
          canPin={true}
          isLastPinned={false}
          selectAll={false}
          onSelectAllChange={onSelectAllChange}
          label="Name"
        />,
      );

      fireEvent.click(screen.getByRole("checkbox", { name: /select all rows/i }));
      expect(onSelectAllChange).toHaveBeenCalledWith(true);
    });

    it("renders read-only when selectAll is provided without onSelectAllChange", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1");

      render(
        <HeaderCellWrapper
          header={header}
          column={column}
          canSort={false}
          pinned={false}
          canPin={true}
          isLastPinned={false}
          selectAll={false}
          label="Name"
        />,
      );

      expect(screen.getByRole("checkbox", { name: /select all rows/i })).toHaveAttribute(
        "readOnly",
      );
    });
  });

  describe("pin toggle", () => {
    it("renders pin toggle button when canPin is true", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1", { getCanPin: vi.fn(() => true) });

      render(
        <HeaderCellWrapper
          header={header}
          column={column}
          canSort={false}
          pinned={false}
          canPin={true}
          label="Name"
        />,
      );

      const pinButton = screen.getByRole("button", { name: /pin column/i });
      expect(pinButton).toBeInTheDocument();
      expect(pinButton).toHaveAttribute("aria-pressed", "false");
    });

    it("shows pressed state when pinned", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1", {
        getCanPin: vi.fn(() => true),
        getIsPinned: vi.fn((): ColumnPinningPosition => "start"),
      });

      render(
        <HeaderCellWrapper
          header={header}
          column={column}
          canSort={false}
          pinned="start"
          canPin={true}
          label="Name"
        />,
      );

      const pinButton = screen.getByRole("button", { name: /unpin column/i });
      expect(pinButton).toHaveAttribute("aria-pressed", "true");
    });

    it("calls column.pin('start') when clicking unpinned toggle", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1", {
        getCanPin: vi.fn(() => true),
        getIsPinned: vi.fn((): ColumnPinningPosition => false),
        pin: vi.fn(),
      });

      render(
        <HeaderCellWrapper
          header={header}
          column={column}
          canSort={false}
          pinned={false}
          canPin={true}
          label="Name"
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: /pin column/i }));
      expect(column.pin).toHaveBeenCalledWith("start");
    });

    it("calls column.pin(false) when clicking pinned toggle", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1", {
        getCanPin: vi.fn(() => true),
        getIsPinned: vi.fn((): ColumnPinningPosition => "start"),
        pin: vi.fn(),
      });

      render(
        <HeaderCellWrapper
          header={header}
          column={column}
          canSort={false}
          pinned="start"
          canPin={true}
          label="Name"
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: /unpin column/i }));
      expect(column.pin).toHaveBeenCalledWith(false);
    });

    it("does not render pin toggle when canPin is false", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1", { getCanPin: vi.fn(() => false) });

      render(
        <HeaderCellWrapper
          header={header}
          column={column}
          canSort={false}
          canPin={false}
          label="Name"
        />,
      );

      expect(screen.queryByRole("button", { name: /pin|unpin/i })).not.toBeInTheDocument();
    });
  });

  describe("pinned column styling", () => {
    it("applies cph-table__pinned and cph-table__pinned-head classes when pinned start", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1", {
        getIsPinned: vi.fn((): ColumnPinningPosition => "start"),
      });

      render(
        <HeaderCellWrapper
          header={header}
          column={column}
          canSort={false}
          pinned="start"
          canPin={false}
          label="Name"
        />,
      );

      const th = screen.getByRole("columnheader", { name: /name/i });
      expect(th).toHaveClass("cph-table__pinned");
      expect(th).toHaveClass("cph-table__pinned-head");
    });

    it("applies inline left style from pinned offset context", () => {
      const header = createMockHeader("col-1", {
        column: {
          getIsPinned: vi.fn((): ColumnPinningPosition => "start"),
          getIsLastColumn: vi.fn(() => true),
          getSize: vi.fn(() => 100),
        },
      });
      const column = createMockColumn("col-1", {
        getIsPinned: vi.fn((): ColumnPinningPosition => "start"),
      });

      // Create a mock table with the specific header for offset computation
      const startLeafHeaders = [
        {
          id: "col-1",
          getSize: vi.fn(() => 100),
          column: {
            getIsPinned: vi.fn((): ColumnPinningPosition => "start"),
            getIsLastColumn: vi.fn(() => true),
          },
        },
      ];
      const startVisibleLeafColumns = [
        { id: "col-1", columnDef: { meta: { widthClass: "source" } } },
      ];
      const mockTable = {
        getStartLeafHeaders: vi.fn(() => startLeafHeaders),
        getStartVisibleLeafColumns: vi.fn(() => startVisibleLeafColumns),
        getCenterVisibleLeafColumns: vi.fn(() => []),
        getEndVisibleLeafColumns: vi.fn(() => []),
      } as unknown as Table<CphTableFeatures, RowData>;

      const TestConsumer = () => {
        const offset = usePinnedOffset("col-1");
        return <span data-testid="offset">{JSON.stringify(offset)}</span>;
      };

      render(
        <CphDataTable table={mockTable}>
          <HeaderCell
            header={header}
            column={column}
            canSort={false}
            sortDirection={undefined}
            pinned="start"
            canPin={false}
            isLastPinned={false}
          >
            Name
          </HeaderCell>
          <TestConsumer />
        </CphDataTable>,
      );

      const th = screen.getByRole("columnheader", { name: /name/i });
      expect(th).toHaveAttribute("style");
      expect(th).toHaveStyle({ left: "0px" });
    });

    it("does not apply pinned classes when not pinned", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1", {
        getIsPinned: vi.fn((): ColumnPinningPosition => false),
      });

      render(
        <HeaderCellWrapper
          header={header}
          column={column}
          canSort={false}
          pinned={false}
          canPin={false}
          label="Name"
        />,
      );

      const th = screen.getByRole("columnheader", { name: /name/i });
      expect(th).not.toHaveClass("cph-table__pinned");
      expect(th).not.toHaveClass("cph-table__pinned-head");
    });

    it("does not apply pinned classes when pinned end", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1", {
        getIsPinned: vi.fn((): ColumnPinningPosition => "end"),
      });

      render(
        <HeaderCellWrapper
          header={header}
          column={column}
          canSort={false}
          pinned="end"
          canPin={false}
          label="Name"
        />,
      );

      const th = screen.getByRole("columnheader", { name: /name/i });
      expect(th).not.toHaveClass("cph-table__pinned");
      expect(th).not.toHaveClass("cph-table__pinned-head");
    });
  });

  describe("placeholder headers", () => {
    it("renders empty th for placeholder headers", () => {
      const header = createMockHeader("col-1", { isPlaceholder: true });
      const column = createMockColumn("col-1");

      render(<HeaderCellWrapper header={header} column={column} canSort={false} label="Name" />);

      const th = screen.getByRole("columnheader", { hidden: true });
      expect(th).toBeInTheDocument();
      expect(th).toHaveAttribute("data-cph-table", "placeholder");
    });
  });

  describe("className composition", () => {
    it("applies custom className string", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1");

      render(
        <HeaderCellWrapper
          header={header}
          column={column}
          canSort={false}
          className="cph-test-custom-class"
          label="Name"
        />,
      );

      const th = screen.getByRole("columnheader", { name: /name/i });
      expect(th).toHaveClass("cph-test-custom-class");
    });

    it("composes with render-props callback className", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1");
      const classNameFn = vi.fn(() => "from-callback");

      render(
        <HeaderCellWrapper
          header={header}
          column={column}
          canSort={false}
          className={classNameFn}
          label="Name"
        />,
      );

      const th = screen.getByRole("columnheader", { name: /name/i });
      expect(th).toHaveClass("from-callback");
    });
  });
});
