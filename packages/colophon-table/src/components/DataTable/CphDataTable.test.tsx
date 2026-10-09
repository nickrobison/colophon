/** @packageDocumentation Tests for CphDataTable. */

import type { Table, RowData, ColumnPinningPosition } from "@tanstack/react-table";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { CphTableFeatures } from "../../table/features";
import { CphTableDensityProvider } from "../../theme/CphTableDensity";
import { CphDataTable, usePinnedOffset } from "./CphDataTable";
import { computePinnedOffsets } from "./pinnedOffsets";

// Test data type
type TestRow = RowData & {
  id: string;
  name: string;
  value: number;
};

// Minimal mock header for testing
function createMockHeader(
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
      getIsLastColumn: vi.fn((pos?: ColumnPinningPosition | "center") =>
        pos === "start" || pos === "end" ? isLast : false,
      ),
    },
  };
}

// Minimal mock column for testing
function createMockColumn(id: string, widthClass?: string) {
  return {
    id,
    columnDef: {
      meta: widthClass ? { widthClass } : {},
    },
  };
}

// Minimal mock table for testing
function createMockTable(
  overrides: Partial<{
    startLeafHeaders: ReturnType<typeof createMockHeader>[];
    endLeafHeaders: ReturnType<typeof createMockHeader>[];
    startVisibleLeafColumns: ReturnType<typeof createMockColumn>[];
    centerVisibleLeafColumns: ReturnType<typeof createMockColumn>[];
    endVisibleLeafColumns: ReturnType<typeof createMockColumn>[];
  }> = {},
) {
  const startLeafHeaders = overrides.startLeafHeaders ?? [
    createMockHeader("col-1", 100, "start", false),
    createMockHeader("col-2", 120, "start", true),
  ];
  const startVisibleLeafColumns = overrides.startVisibleLeafColumns ?? [
    createMockColumn("col-1", "source"),
    createMockColumn("col-2", "type"),
  ];
  const centerVisibleLeafColumns = overrides.centerVisibleLeafColumns ?? [
    createMockColumn("col-3", "collection"),
    createMockColumn("col-4", "status"),
  ];
  const endVisibleLeafColumns = overrides.endVisibleLeafColumns ?? [
    createMockColumn("col-5", "number"),
  ];

  return {
    getStartLeafHeaders: vi.fn(() => startLeafHeaders),
    getEndLeafHeaders: vi.fn(() => overrides.endLeafHeaders ?? []),
    getStartVisibleLeafColumns: vi.fn(() => startVisibleLeafColumns),
    getCenterVisibleLeafColumns: vi.fn(() => centerVisibleLeafColumns),
    getEndVisibleLeafColumns: vi.fn(() => endVisibleLeafColumns),
  } as unknown as Table<CphTableFeatures, TestRow>;
}

describe("CphDataTable", () => {
  it("renders root, scroll, and table elements with correct classes", () => {
    const table = createMockTable();
    render(
      <CphDataTable table={table}>
        <thead data-testid="thead" />
        <tbody data-testid="tbody" />
      </CphDataTable>,
    );

    expect(screen.getByTestId("thead").closest(".cph-table-root")).toBeInTheDocument();
    expect(screen.getByTestId("thead").closest(".cph-table-scroll")).toBeInTheDocument();
    expect(screen.getByTestId("thead").closest(".cph-table")).toBeInTheDocument();
  });

  it("renders a colgroup with one col per visible leaf column in visual order", () => {
    const table = createMockTable();
    const { container } = render(
      <CphDataTable table={table}>
        <thead />
        <tbody />
      </CphDataTable>,
    );

    const cols = container.querySelectorAll("col");
    expect(cols).toHaveLength(5);
    // key is a React internal prop, not rendered to DOM
    expect(cols[0]).toBeInTheDocument();
    expect(cols[1]).toBeInTheDocument();
    expect(cols[2]).toBeInTheDocument();
    expect(cols[3]).toBeInTheDocument();
    expect(cols[4]).toBeInTheDocument();
  });

  it("applies widthClass from column meta as cph-table__col-* class on col elements", () => {
    const table = createMockTable();
    const { container } = render(
      <CphDataTable table={table}>
        <thead />
        <tbody />
      </CphDataTable>,
    );

    const cols = container.querySelectorAll("col");
    expect(cols[0]).toHaveClass("cph-table__col-source");
    expect(cols[1]).toHaveClass("cph-table__col-type");
    expect(cols[2]).toHaveClass("cph-table__col-collection");
    expect(cols[3]).toHaveClass("cph-table__col-status");
    expect(cols[4]).toHaveClass("cph-table__col-number");
  });

  it("omits class on col when widthClass is not provided", () => {
    const table = createMockTable({
      startVisibleLeafColumns: [createMockColumn("col-1")],
      centerVisibleLeafColumns: [],
      endVisibleLeafColumns: [],
    });
    const { container } = render(
      <CphDataTable table={table}>
        <thead />
        <tbody />
      </CphDataTable>,
    );

    const col = container.querySelector("col");
    expect(col).not.toHaveClass("cph-table__col-source");
    expect(col?.className).toBe("");
  });

  it("computes strictly increasing left offsets for multiple start-pinned columns", () => {
    const table = createMockTable({
      startLeafHeaders: [
        createMockHeader("col-1", 100, "start", false),
        createMockHeader("col-2", 120, "start", true),
      ],
    });
    render(
      <CphDataTable table={table}>
        <thead />
        <tbody />
      </CphDataTable>,
    );

    // The offsets are computed internally; we verify via the context consumer
    // by rendering a test component that uses usePinnedOffset
    const TestConsumer = ({ headerId }: { headerId: string }) => {
      const offset = usePinnedOffset(headerId);
      return <span data-testid={`offset-${headerId}`}>{JSON.stringify(offset)}</span>;
    };

    render(
      <CphDataTable table={table}>
        <TestConsumer headerId="col-1" />
        <TestConsumer headerId="col-2" />
        <thead />
        <tbody />
      </CphDataTable>,
    );

    const offset1 = JSON.parse(screen.getByTestId("offset-col-1").textContent ?? "null");
    expect(offset1).toEqual({ left: 0, isLast: false });

    const offset2 = JSON.parse(screen.getByTestId("offset-col-2").textContent ?? "null");
    expect(offset2).toEqual({ left: 100, isLast: true });

    // Verify strictly increasing
    expect(offset2.left).toBeGreaterThan(offset1.left);
  });

  it("excludes unpinned columns from the offsets map but tracks both regions", () => {
    const table = createMockTable({
      startLeafHeaders: [
        createMockHeader("col-1", 100, "start", true),
        createMockHeader("col-2", 120, "end", false), // end-pinned, should be excluded
        createMockHeader("col-3", 80, false, false), // not pinned, should be excluded
      ],
    });
    render(
      <CphDataTable table={table}>
        <thead />
        <tbody />
      </CphDataTable>,
    );

    const TestConsumer = ({ headerId }: { headerId: string }) => {
      const offset = usePinnedOffset(headerId);
      return <span data-testid={`offset-${headerId}`}>{offset ? "found" : "undefined"}</span>;
    };

    render(
      <CphDataTable table={table}>
        <TestConsumer headerId="col-1" />
        <TestConsumer headerId="col-2" />
        <TestConsumer headerId="col-3" />
        <thead />
        <tbody />
      </CphDataTable>,
    );

    expect(screen.getByTestId("offset-col-1")).toHaveTextContent("found");
    expect(screen.getByTestId("offset-col-2")).toHaveTextContent("found");
    expect(screen.getByTestId("offset-col-3")).toHaveTextContent("undefined");
  });

  it("passes through additional props to the root div", () => {
    const table = createMockTable();
    render(
      <CphDataTable table={table} data-testid="custom-root" id="my-table">
        <thead />
        <tbody />
      </CphDataTable>,
    );

    expect(screen.getByTestId("custom-root")).toHaveAttribute("id", "my-table");
  });

  it("passes through className to the root div", () => {
    const table = createMockTable();
    render(
      <CphDataTable table={table} className="cph-test-custom-class">
        <thead data-testid="thead" />
        <tbody />
      </CphDataTable>,
    );

    expect(screen.getByTestId("thead").closest(".cph-table-root")).toHaveClass(
      "cph-test-custom-class",
    );
  });

  it("applies tableLabel as aria-label on the table element itself", () => {
    const table = createMockTable();
    render(
      <CphDataTable table={table} tableLabel="Ledger register">
        <thead />
        <tbody />
      </CphDataTable>,
    );

    const tableEl = screen.getByRole("table", { name: "Ledger register" });
    expect(tableEl).toHaveClass("cph-table");
    expect(tableEl.closest(".cph-table-root")).not.toHaveAttribute("aria-label");
  });

  it("omits the aria-label attribute when tableLabel is not provided", () => {
    const table = createMockTable();
    const { container } = render(
      <CphDataTable table={table}>
        <thead />
        <tbody />
      </CphDataTable>,
    );

    expect(container.querySelector("table.cph-table")).not.toHaveAttribute("aria-label");
  });

  it("sets data-density from context, defaulting to compact without a provider", () => {
    const table = createMockTable();
    render(
      <CphDataTable table={table} data-testid="density-root">
        <thead />
        <tbody />
      </CphDataTable>,
    );

    expect(screen.getByTestId("density-root")).toHaveAttribute("data-density", "compact");
  });

  it("sets data-density from an explicit provider value", () => {
    const table = createMockTable();
    render(
      <CphTableDensityProvider density="dense">
        <CphDataTable table={table} data-testid="density-root">
          <thead />
          <tbody />
        </CphDataTable>
      </CphTableDensityProvider>,
    );

    expect(screen.getByTestId("density-root")).toHaveAttribute("data-density", "dense");
  });

  it("renders summary tfoot when showSummary is true", () => {
    const table = {
      ...createMockTable(),
      getCoreRowModel: vi.fn(() => ({ rows: [] })),
      getFilteredRowModel: vi.fn(() => ({ rows: [] })),
      getAllLeafColumns: vi.fn(() => []),
    } as unknown as Table<CphTableFeatures, TestRow>;
    const { container } = render(
      <CphDataTable table={table} showSummary>
        <thead />
        <tbody />
      </CphDataTable>,
    );

    expect(container.querySelector("tfoot.cph-table__summary")).toBeInTheDocument();
  });

  it("renders no tfoot when showSummary is false or absent", () => {
    const table = createMockTable();
    const { container, rerender } = render(
      <CphDataTable table={table} showSummary={false}>
        <thead />
        <tbody />
      </CphDataTable>,
    );

    expect(container.querySelector("tfoot")).not.toBeInTheDocument();

    rerender(
      <CphDataTable table={table}>
        <thead />
        <tbody />
      </CphDataTable>,
    );

    expect(container.querySelector("tfoot")).not.toBeInTheDocument();
  });
});

describe("computePinnedOffsets (pure function)", () => {
  it("returns empty map for empty headers array", () => {
    const result = computePinnedOffsets([]);
    expect(result.size).toBe(0);
  });

  it("accumulates left offsets correctly for multiple start-pinned headers", () => {
    const headers = [
      createMockHeader("a", 100, "start", false),
      createMockHeader("b", 120, "start", false),
      createMockHeader("c", 80, "start", true),
    ];
    const result = computePinnedOffsets(headers);

    expect(result.get("a")).toEqual({ left: 0, isLast: false });
    expect(result.get("b")).toEqual({ left: 100, isLast: false });
    expect(result.get("c")).toEqual({ left: 220, isLast: true });
  });

  it("skips unpinned headers but tracks both pinned regions", () => {
    const headers = [
      createMockHeader("a", 100, "start", false),
      createMockHeader("b", 120, "end", false),
      createMockHeader("c", 80, false, false),
      createMockHeader("d", 90, "start", true),
    ];
    const result = computePinnedOffsets(headers);

    expect(result.has("a")).toBe(true);
    expect(result.has("b")).toBe(true);
    expect(result.has("c")).toBe(false);
    expect(result.has("d")).toBe(true);
    expect(result.get("d")?.left).toBe(100); // only 'a' contributes to running total
    expect(result.get("b")).toEqual({ left: 0, isLast: false, right: 0 });
  });

  it("accumulates right offsets for multiple end-pinned headers in reverse", () => {
    const headers = [
      createMockHeader("a", 100, "start", false),
      createMockHeader("b", 80, false, false),
      createMockHeader("c", 120, "end", false),
      createMockHeader("d", 90, "end", true),
    ];
    const result = computePinnedOffsets(headers);

    expect(result.get("d")).toEqual({ left: 0, isLast: true, right: 0 });
    expect(result.get("c")).toEqual({ left: 0, isLast: false, right: 90 });
  });

  it("isLast comes from column.getIsLastColumn('start')", () => {
    const headers = [
      createMockHeader("a", 100, "start", false),
      createMockHeader("b", 120, "start", true),
    ];
    const result = computePinnedOffsets(headers);

    expect(result.get("a")?.isLast).toBe(false);
    expect(result.get("b")?.isLast).toBe(true);
  });
});
