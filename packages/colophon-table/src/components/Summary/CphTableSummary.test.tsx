import type { RowData, Table } from "@tanstack/react-table";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { CphColumnMeta } from "../../table/column";
import type { CphTableFeatures } from "../../table/features";
import { CphTableSummary } from "./CphTableSummary";

/**
 * Creates a minimal mock TanStack Table instance for testing.
 */
function createMockTable(
  overrides: Partial<{
    leafColumns: Array<{
      id: string;
      getIsVisible: () => boolean;
      getIsPinned: () => "start" | "end" | false;
      columnDef: { meta?: CphColumnMeta };
      getAggregationValue: (options: { rows: unknown[] }) => unknown;
    }>;
    filteredRows: unknown[];
  }>,
): Table<CphTableFeatures, RowData> {
  const defaultLeafColumns = [
    {
      id: "name",
      getIsVisible: () => true,
      getIsPinned: () => "start" as const,
      columnDef: { meta: { numeric: false } },
      getAggregationValue: vi.fn(() => null),
    },
    {
      id: "value",
      getIsVisible: () => true,
      getIsPinned: () => false as const,
      columnDef: {
        meta: {
          aggregate: "sum" as const,
          numeric: true,
          format: (v: unknown) => Number(v).toLocaleString("en-US"),
        },
      },
      getAggregationValue: vi.fn(({ rows }) =>
        rows.reduce((sum: number, r: { value: number }) => sum + r.value, 0),
      ),
    },
    {
      id: "count",
      getIsVisible: () => true,
      getIsPinned: () => false as const,
      columnDef: { meta: { aggregate: "count" as const, numeric: true } },
      getAggregationValue: vi.fn(({ rows }) => rows.length),
    },
  ];

  const leafColumns = overrides.leafColumns ?? defaultLeafColumns;
  const filteredRows = overrides.filteredRows ?? [
    { name: "A", value: 10, count: 1 },
    { name: "B", value: 20, count: 1 },
    { name: "C", value: 30, count: 1 },
  ];

  return {
    getAllLeafColumns: vi.fn(() => leafColumns),
    getFilteredRowModel: vi.fn(() => ({ rows: filteredRows })),
  } as unknown as Table<CphTableFeatures, RowData>;
}

describe("CphTableSummary", () => {
  it("renders NO tfoot when showSummary is false", () => {
    const table = createMockTable({});
    render(<CphTableSummary table={table} showSummary={false} />);
    expect(screen.queryByRole("rowgroup", { name: /summary/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId("summary")).not.toBeInTheDocument();
    // More direct check: no tfoot element at all
    const tfoot = document.querySelector("tfoot");
    expect(tfoot).toBeNull();
  });

  it("renders NO tfoot when showSummary is absent", () => {
    const table = createMockTable({});
    render(<CphTableSummary table={table} />);
    const tfoot = document.querySelector("tfoot");
    expect(tfoot).toBeNull();
  });

  it("renders tfoot with per-column cells when showSummary is true", () => {
    const table = createMockTable({});
    render(<CphTableSummary table={table} showSummary={true} totalCount={10} />);

    const tfoot = screen.getByRole("rowgroup", { name: /summary/i });
    expect(tfoot).toBeInTheDocument();
    expect(tfoot).toHaveClass("cph-table__summary");

    // Should have 3 cells (th + 2 tds) for 3 leaf columns
    const cells = tfoot.querySelectorAll("th, td");
    expect(cells).toHaveLength(3);

    // First cell is th with scope="row"
    const th = tfoot.querySelector("th[scope='row']");
    expect(th).toBeInTheDocument();
    expect(th).toHaveClass("cph-table__pinned"); // first column is pinned

    // Second cell is td with numeric class
    const tds = tfoot.querySelectorAll("td");
    expect(tds).toHaveLength(2);
    expect(tds[0]).toHaveClass("cph-table__numeric"); // value column is numeric
    expect(tds[1]).toHaveClass("cph-table__numeric"); // count column is numeric
  });

  it("shows sum of FILTERED rows for sum aggregate", () => {
    const filteredRows = [
      { name: "A", value: 10 },
      { name: "B", value: 20 },
      { name: "C", value: 30 },
    ];
    const table = createMockTable({
      filteredRows,
      leafColumns: [
        {
          id: "name",
          getIsVisible: () => true,
          getIsPinned: () => "start" as const,
          columnDef: { meta: { numeric: false } },
          getAggregationValue: vi.fn(() => null),
        },
        {
          id: "value",
          getIsVisible: () => true,
          getIsPinned: () => false,
          columnDef: {
            meta: {
              aggregate: "sum" as const,
              numeric: true,
              format: (v: unknown) => Number(v).toLocaleString("en-US"),
            },
          },
          getAggregationValue: vi.fn(({ rows }) =>
            rows.reduce((sum: number, r: { value: number }) => sum + r.value, 0),
          ),
        },
      ],
    });

    render(<CphTableSummary table={table} showSummary={true} totalCount={10} />);

    const tfoot = screen.getByRole("rowgroup", { name: /summary/i });
    const valueCell = tfoot.querySelector(
      "td[data-cph-table='summary-cell']:not(.cph-table__pinned)",
    );
    expect(valueCell).toHaveTextContent("60"); // 10 + 20 + 30 = 60
  });

  it("shows count of FILTERED rows for count aggregate", () => {
    const filteredRows = [
      { name: "A", value: 10 },
      { name: "B", value: 20 },
      { name: "C", value: 30 },
    ];
    const table = createMockTable({
      filteredRows,
      leafColumns: [
        {
          id: "name",
          getIsVisible: () => true,
          getIsPinned: () => "start" as const,
          columnDef: { meta: { numeric: false } },
          getAggregationValue: vi.fn(() => null),
        },
        {
          id: "count",
          getIsVisible: () => true,
          getIsPinned: () => false,
          columnDef: { meta: { aggregate: "count" as const, numeric: true } },
          getAggregationValue: vi.fn(({ rows }) => rows.length),
        },
      ],
    });

    render(<CphTableSummary table={table} showSummary={true} totalCount={10} />);

    const tfoot = screen.getByRole("rowgroup", { name: /summary/i });
    const countCell = tfoot.querySelector("td[data-cph-table='summary-cell']");
    expect(countCell).toHaveTextContent("3"); // 3 filtered rows
  });

  it("renders 'of N total' note when filtered count differs from total", () => {
    const filteredRows = [
      { name: "A", value: 10 },
      { name: "B", value: 20 },
    ];
    const table = createMockTable({
      filteredRows,
      leafColumns: [
        {
          id: "name",
          getIsVisible: () => true,
          getIsPinned: () => "start" as const,
          columnDef: { meta: { numeric: false } },
          getAggregationValue: vi.fn(() => null),
        },
        {
          id: "value",
          getIsVisible: () => true,
          getIsPinned: () => false,
          columnDef: { meta: { aggregate: "sum" as const, numeric: true } },
          getAggregationValue: vi.fn(({ rows }) =>
            rows.reduce((sum: number, r: { value: number }) => sum + r.value, 0),
          ),
        },
      ],
    });

    render(<CphTableSummary table={table} showSummary={true} totalCount={10} />);

    const tfoot = screen.getByRole("rowgroup", { name: /summary/i });
    const note = tfoot.querySelector("small[data-cph-table='total-note']");
    expect(note).toBeInTheDocument();
    expect(note).toHaveTextContent("of 10 total");
  });

  it("does NOT render 'of N total' note when filtered count equals total", () => {
    const filteredRows = [
      { name: "A", value: 10 },
      { name: "B", value: 20 },
      { name: "C", value: 30 },
    ];
    const table = createMockTable({
      filteredRows,
      leafColumns: [
        {
          id: "name",
          getIsVisible: () => true,
          getIsPinned: () => "start" as const,
          columnDef: { meta: { numeric: false } },
          getAggregationValue: vi.fn(() => null),
        },
        {
          id: "value",
          getIsVisible: () => true,
          getIsPinned: () => false,
          columnDef: { meta: { aggregate: "sum" as const, numeric: true } },
          getAggregationValue: vi.fn(({ rows }) =>
            rows.reduce((sum: number, r: { value: number }) => sum + r.value, 0),
          ),
        },
      ],
    });

    render(<CphTableSummary table={table} showSummary={true} totalCount={3} />);

    const tfoot = screen.getByRole("rowgroup", { name: /summary/i });
    const note = tfoot.querySelector("small[data-cph-table='total-note']");
    expect(note).not.toBeInTheDocument();
  });

  it("does NOT render 'of N total' note when totalCount is not provided", () => {
    const table = createMockTable({});
    render(<CphTableSummary table={table} showSummary={true} />);

    const tfoot = screen.getByRole("rowgroup", { name: /summary/i });
    const note = tfoot.querySelector("small[data-cph-table='total-note']");
    expect(note).not.toBeInTheDocument();
  });

  it("applies cph-table__pinned class to pinned columns", () => {
    const table = createMockTable({
      leafColumns: [
        {
          id: "name",
          getIsVisible: () => true,
          getIsPinned: () => "start" as const,
          columnDef: { meta: { numeric: false } },
          getAggregationValue: vi.fn(() => null),
        },
        {
          id: "value",
          getIsVisible: () => true,
          getIsPinned: () => false,
          columnDef: { meta: { aggregate: "sum" as const, numeric: true } },
          getAggregationValue: vi.fn(({ rows }) =>
            rows.reduce((sum: number, r: { value: number }) => sum + r.value, 0),
          ),
        },
        {
          id: "pinnedEnd",
          getIsVisible: () => true,
          getIsPinned: () => "end" as const,
          columnDef: { meta: { aggregate: "mean" as const, numeric: true } },
          getAggregationValue: vi.fn(
            ({ rows }) =>
              rows.reduce((sum: number, r: { value: number }) => sum + r.value, 0) / rows.length,
          ),
        },
      ],
    });

    render(<CphTableSummary table={table} showSummary={true} totalCount={10} />);

    const tfoot = screen.getByRole("rowgroup", { name: /summary/i });
    const cells = tfoot.querySelectorAll("[data-cph-table='summary-cell']");

    // First cell (th) should be pinned
    expect(cells[0]).toHaveClass("cph-table__pinned");
    // Second cell (td) should not be pinned
    expect(cells[1]).not.toHaveClass("cph-table__pinned");
    // Third cell (td) should be pinned (end)
    expect(cells[2]).toHaveClass("cph-table__pinned");
  });

  it("renders empty cells for columns without aggregate", () => {
    const table = createMockTable({
      leafColumns: [
        {
          id: "name",
          getIsVisible: () => true,
          getIsPinned: () => "start" as const,
          columnDef: { meta: { numeric: false } },
          getAggregationValue: vi.fn(() => null),
        },
        {
          id: "description",
          getIsVisible: () => true,
          getIsPinned: () => false,
          columnDef: { meta: { numeric: false } }, // no aggregate
          getAggregationValue: vi.fn(() => null),
        },
        {
          id: "value",
          getIsVisible: () => true,
          getIsPinned: () => false,
          columnDef: { meta: { aggregate: "sum" as const, numeric: true } },
          getAggregationValue: vi.fn(({ rows }) =>
            rows.reduce((sum: number, r: { value: number }) => sum + r.value, 0),
          ),
        },
      ],
    });

    render(<CphTableSummary table={table} showSummary={true} totalCount={10} />);

    const tfoot = screen.getByRole("rowgroup", { name: /summary/i });
    const cells = tfoot.querySelectorAll("td[data-cph-table='summary-cell']");

    // description column (index 1 in tds, index 2 overall) should be empty
    expect(cells[0]).toHaveTextContent(""); // description column
    expect(cells[1]).toHaveTextContent("60"); // value column
  });

  it("uses column formatter when provided", () => {
    const table = createMockTable({
      leafColumns: [
        {
          id: "name",
          getIsVisible: () => true,
          getIsPinned: () => "start" as const,
          columnDef: { meta: { numeric: false } },
          getAggregationValue: vi.fn(() => null),
        },
        {
          id: "value",
          getIsVisible: () => true,
          getIsPinned: () => false,
          columnDef: {
            meta: {
              aggregate: "sum" as const,
              numeric: true,
              format: (v: unknown) => `$${Number(v).toLocaleString("en-US")}`,
            },
          },
          getAggregationValue: vi.fn(({ rows }) =>
            rows.reduce((sum: number, r: { value: number }) => sum + r.value, 0),
          ),
        },
      ],
    });

    render(<CphTableSummary table={table} showSummary={true} totalCount={10} />);

    const tfoot = screen.getByRole("rowgroup", { name: /summary/i });
    const valueCell = tfoot.querySelector("td:not(.cph-table__pinned)");
    expect(valueCell).toHaveTextContent("$60");
  });
});
