/** @packageDocumentation Tests for HeaderCell. */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { HeaderCell } from "./HeaderCell";
import { CphDataTable, usePinnedOffset } from "../DataTable/CphDataTable";
import type { Header, Column, Table, RowData } from "@tanstack/react-table";
import type { CphTableFeatures } from "../../table/features";

// Minimal mock header for testing
function createMockHeader(id: string, overrides: Partial<{
  isPlaceholder: boolean;
  column: Partial<Column<CphTableFeatures, RowData, unknown>>;
}> = {}) {
  const column = createMockColumn(id, overrides.column);
  return {
    id,
    isPlaceholder: overrides.isPlaceholder ?? false,
    placeholderId: `placeholder-${id}`,
    column,
    getLeafHeaders: vi.fn(() => []),
    getContext: vi.fn(() => ({ header: {}, column, table: {} })),
    depth: 0,
    index: 0,
    rowSpan: 1,
    colSpan: 1,
    subHeaders: [],
    headerGroup: null,
    table: {} as any,
  } as unknown as Header<CphTableFeatures, RowData, unknown>;
}

// Minimal mock column for testing
function createMockColumn(id: string, overrides: Partial<{
  getCanSort: () => boolean;
  getIsSorted: () => boolean | "asc" | "desc";
  getSortIndex: () => number;
  getIsPinned: () => "start" | "end" | false;
  getCanPin: () => boolean;
  getIsLastColumn: (pos?: string) => boolean;
  toggleSorting: () => void;
  pin: (pos: "start" | "end" | false) => void;
}> = {}) {
  return {
    id,
    getCanSort: overrides.getCanSort ?? vi.fn(() => true),
    getIsSorted: overrides.getIsSorted ?? vi.fn(() => false),
    getSortIndex: overrides.getSortIndex ?? vi.fn(() => 0),
    getIsPinned: overrides.getIsPinned ?? vi.fn(() => false),
    getCanPin: overrides.getCanPin ?? vi.fn(() => true),
    getIsLastColumn: overrides.getIsLastColumn ?? vi.fn((pos?: string) => pos === "start" ? false : false),
    toggleSorting: overrides.toggleSorting ?? vi.fn(),
    pin: overrides.pin ?? vi.fn(),
    columnDef: { meta: {} },
    getFlatColumns: vi.fn(() => []),
    getLeafColumns: vi.fn(() => []),
    depth: 0,
    columns: [],
    parent: undefined,
    table: {} as any,
    accessorFn: undefined,
  } as unknown as Column<CphTableFeatures, RowData, unknown>;
}

// Minimal mock table for testing - provides all methods CphDataTable needs
function createMockTable() {
  const startLeafHeaders = [
    createMockHeader("col-1"),
    createMockHeader("col-2"),
  ];
  const startVisibleLeafColumns = [
    { id: "col-1", columnDef: { meta: { widthClass: "source" } } },
    { id: "col-2", columnDef: { meta: { widthClass: "type" } } },
  ];
  const centerVisibleLeafColumns = [
    { id: "col-3", columnDef: { meta: { widthClass: "collection" } } },
  ];
  const endVisibleLeafColumns = [
    { id: "col-4", columnDef: { meta: { widthClass: "number" } } },
  ];

  return {
    getStartLeafHeaders: vi.fn(() => startLeafHeaders),
    getStartVisibleLeafColumns: vi.fn(() => startVisibleLeafColumns),
    getCenterVisibleLeafColumns: vi.fn(() => centerVisibleLeafColumns),
    getEndVisibleLeafColumns: vi.fn(() => endVisibleLeafColumns),
  } as unknown as Table<CphTableFeatures, unknown>;
}

// Wrapper component that provides the PinnedOffsetsContext via a real CphDataTable
function HeaderCellWrapper({
  header,
  column,
  pinned = false,
  canPin = true,
  ...props
}: {
  header: Header<CphTableFeatures, RowData, unknown>;
  column: Column<CphTableFeatures, RowData, unknown>;
  pinned?: "start" | "end" | false;
  canPin?: boolean;
} & Omit<Parameters<typeof HeaderCell>[0], "header" | "column">) {
  const table = createMockTable();
  return (
    <CphDataTable table={table}>
      <HeaderCell header={header} column={column} pinned={pinned} canPin={canPin} {...props} />
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
        getIsSorted: vi.fn(() => false),
      });

      render(<HeaderCellWrapper header={header} column={column} canSort={true} sortDirection={undefined} children="Name" />);

      const th = screen.getByRole("columnheader", { name: /name/i });
      expect(th).not.toHaveAttribute("aria-sort");
    });

    it("is 'ascending' when sorted asc", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1", {
        getIsSorted: vi.fn(() => "asc"),
      });

      render(<HeaderCellWrapper header={header} column={column} canSort={true} sortDirection="asc" children="Name" />);

      const th = screen.getByRole("columnheader", { name: /name/i });
      expect(th).toHaveAttribute("aria-sort", "ascending");
    });

    it("is 'descending' when sorted desc", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1", {
        getIsSorted: vi.fn(() => "desc"),
      });

      render(<HeaderCellWrapper header={header} column={column} canSort={true} sortDirection="desc" children="Name" />);

      const th = screen.getByRole("columnheader", { name: /name/i });
      expect(th).toHaveAttribute("aria-sort", "descending");
    });
  });

  describe("sort affordance", () => {
    it("renders a button with cph-table__sort class when canSort is true", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1");

      render(<HeaderCellWrapper header={header} column={column} canSort={true} sortDirection={undefined} children="Name" />);

      const button = screen.getByRole("button", { name: /sort ascending/i });
      expect(button).toHaveClass("cph-table__sort");
    });

    it("renders label and arrow-only glyph (no words like 'ascending' in arrow)", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1");

      render(<HeaderCellWrapper header={header} column={column} canSort={true} sortDirection="asc" children="Name" />);

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
        <HeaderCellWrapper header={header} column={column} canSort={true} sortDirection={undefined} children="Name" />,
      );
      let arrow = screen.getByRole("button", { name: /sort ascending/i }).querySelector(".cph-table__sort-arrow");
      expect(arrow).toHaveTextContent("");

      rerender(
        <HeaderCellWrapper header={header} column={column} canSort={true} sortDirection="asc" children="Name" />,
      );
      arrow = screen.getByRole("button", { name: /sort descending/i }).querySelector(".cph-table__sort-arrow");
      expect(arrow).toHaveTextContent("▲");

      rerender(
        <HeaderCellWrapper header={header} column={column} canSort={true} sortDirection="desc" children="Name" />,
      );
      arrow = screen.getByRole("button", { name: /sort ascending/i }).querySelector(".cph-table__sort-arrow");
      expect(arrow).toHaveTextContent("▼");
    });

    it("calls column.toggleSorting() on click", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1", {
        toggleSorting: vi.fn(),
      });

      render(<HeaderCellWrapper header={header} column={column} canSort={true} sortDirection={undefined} children="Name" />);

      fireEvent.click(screen.getByRole("button", { name: /sort ascending/i }));
      expect(column.toggleSorting).toHaveBeenCalledTimes(1);
    });

    it("renders plain label (no button) when canSort is false", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1", { getCanSort: vi.fn(() => false) });

      render(<HeaderCellWrapper header={header} column={column} canSort={false} sortDirection={undefined} children="Name" />);

      expect(screen.queryByRole("button", { name: /sort/i })).not.toBeInTheDocument();
      expect(screen.getByText("Name")).toBeInTheDocument();
    });
  });

  describe("select-all checkbox", () => {
    it("renders checkbox when selectAll prop is provided", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1");

      render(<HeaderCellWrapper header={header} column={column} canSort={false} selectAll={false} children="Name" />);

      const checkbox = screen.getByRole("checkbox", { name: /select all rows/i });
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it("checkbox is checked when selectAll is true", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1");

      render(<HeaderCellWrapper header={header} column={column} canSort={false} selectAll={true} children="Name" />);

      const checkbox = screen.getByRole("checkbox", { name: /select all rows/i });
      expect(checkbox).toBeChecked();
    });

    it("sets indeterminate via ref callback (not prop)", async () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1");

      const { rerender } = render(
        <HeaderCellWrapper header={header} column={column} canSort={false} selectAll={true} selectAllIndeterminate={true} children="Name" />,
      );

      const checkbox = screen.getByRole("checkbox", { name: /select all rows/i });
      // The indeterminate property is set via useEffect, wait for it
      await waitFor(() => expect(checkbox.indeterminate).toBe(true));

      rerender(
        <HeaderCellWrapper header={header} column={column} canSort={false} selectAll={true} selectAllIndeterminate={false} children="Name" />,
      );
      await waitFor(() => expect(checkbox.indeterminate).toBe(false));
    });

    it("does not render checkbox when selectAll is undefined", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1");

      render(<HeaderCellWrapper header={header} column={column} canSort={false} children="Name" />);

      expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    });
  });

  describe("pin toggle", () => {
    it("renders pin toggle button when canPin is true", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1", { getCanPin: vi.fn(() => true) });

      render(<HeaderCellWrapper header={header} column={column} canSort={false} pinned={false} canPin={true} children="Name" />);

      const pinButton = screen.getByRole("button", { name: /pin column/i });
      expect(pinButton).toBeInTheDocument();
      expect(pinButton).toHaveAttribute("aria-pressed", "false");
    });

    it("shows pressed state when pinned", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1", {
        getCanPin: vi.fn(() => true),
        getIsPinned: vi.fn(() => "start"),
      });

      render(<HeaderCellWrapper header={header} column={column} canSort={false} pinned="start" canPin={true} children="Name" />);

      const pinButton = screen.getByRole("button", { name: /unpin column/i });
      expect(pinButton).toHaveAttribute("aria-pressed", "true");
    });

    it("calls column.pin('start') when clicking unpinned toggle", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1", {
        getCanPin: vi.fn(() => true),
        getIsPinned: vi.fn(() => false),
        pin: vi.fn(),
      });

      render(<HeaderCellWrapper header={header} column={column} canSort={false} pinned={false} canPin={true} children="Name" />);

      fireEvent.click(screen.getByRole("button", { name: /pin column/i }));
      expect(column.pin).toHaveBeenCalledWith("start");
    });

    it("calls column.pin(false) when clicking pinned toggle", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1", {
        getCanPin: vi.fn(() => true),
        getIsPinned: vi.fn(() => "start"),
        pin: vi.fn(),
      });

      render(<HeaderCellWrapper header={header} column={column} canSort={false} pinned="start" canPin={true} children="Name" />);

      fireEvent.click(screen.getByRole("button", { name: /unpin column/i }));
      expect(column.pin).toHaveBeenCalledWith(false);
    });

    it("does not render pin toggle when canPin is false", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1", { getCanPin: vi.fn(() => false) });

      render(<HeaderCellWrapper header={header} column={column} canSort={false} canPin={false} children="Name" />);

      expect(screen.queryByRole("button", { name: /pin|unpin/i })).not.toBeInTheDocument();
    });
  });

  describe("pinned column styling", () => {
    it("applies cph-table__pinned and cph-table__pinned-head classes when pinned start", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1", { getIsPinned: vi.fn(() => "start") });

      render(<HeaderCellWrapper header={header} column={column} canSort={false} pinned="start" canPin={false} children="Name" />);

      const th = screen.getByRole("columnheader", { name: /name/i });
      expect(th).toHaveClass("cph-table__pinned");
      expect(th).toHaveClass("cph-table__pinned-head");
    });

    it("applies inline left style from pinned offset context", () => {
      const header = createMockHeader("col-1", { 
        column: { 
          getIsPinned: vi.fn(() => "start"), 
          getIsLastColumn: vi.fn(() => true),
          getSize: vi.fn(() => 100),
        } 
      });
      const column = createMockColumn("col-1", { getIsPinned: vi.fn(() => "start") });

      // Create a mock table with the specific header for offset computation
      const startLeafHeaders = [
        {
          id: "col-1",
          getSize: vi.fn(() => 100),
          column: {
            getIsPinned: vi.fn(() => "start"),
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
      } as unknown as Table<CphTableFeatures, unknown>;

      const TestConsumer = () => {
        const offset = usePinnedOffset("col-1");
        return <span data-testid="offset">{JSON.stringify(offset)}</span>;
      };

      render(
        <CphDataTable table={mockTable}>
          <HeaderCell header={header} column={column} canSort={false} pinned="start" canPin={false} children="Name" />
          <TestConsumer />
        </CphDataTable>,
      );

      const th = screen.getByRole("columnheader", { name: /name/i });
      expect(th).toHaveAttribute("style");
      expect(th).toHaveStyle({ left: "0px" });
    });

    it("does not apply pinned classes when not pinned", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1", { getIsPinned: vi.fn(() => false) });

      render(<HeaderCellWrapper header={header} column={column} canSort={false} pinned={false} canPin={false} children="Name" />);

      const th = screen.getByRole("columnheader", { name: /name/i });
      expect(th).not.toHaveClass("cph-table__pinned");
      expect(th).not.toHaveClass("cph-table__pinned-head");
    });

    it("does not apply pinned classes when pinned end", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1", { getIsPinned: vi.fn(() => "end") });

      render(<HeaderCellWrapper header={header} column={column} canSort={false} pinned="end" canPin={false} children="Name" />);

      const th = screen.getByRole("columnheader", { name: /name/i });
      expect(th).not.toHaveClass("cph-table__pinned");
      expect(th).not.toHaveClass("cph-table__pinned-head");
    });
  });

  describe("placeholder headers", () => {
    it("renders empty th for placeholder headers", () => {
      const header = createMockHeader("col-1", { isPlaceholder: true });
      const column = createMockColumn("col-1");

      render(<HeaderCellWrapper header={header} column={column} canSort={false} children="Name" />);

      const th = screen.getByRole("columnheader", { hidden: true });
      expect(th).toBeInTheDocument();
      expect(th).toHaveAttribute("data-cph-table", "placeholder");
    });
  });

  describe("className composition", () => {
    it("applies custom className string", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1");

      render(<HeaderCellWrapper header={header} column={column} canSort={false} className="custom-class" children="Name" />);

      const th = screen.getByRole("columnheader", { name: /name/i });
      expect(th).toHaveClass("custom-class");
    });

    it("composes with render-props callback className", () => {
      const header = createMockHeader("col-1");
      const column = createMockColumn("col-1");
      const classNameFn = vi.fn(() => "from-callback");

      render(<HeaderCellWrapper header={header} column={column} canSort={false} className={classNameFn} children="Name" />);

      const th = screen.getByRole("columnheader", { name: /name/i });
      expect(th).toHaveClass("from-callback");
    });
  });
});