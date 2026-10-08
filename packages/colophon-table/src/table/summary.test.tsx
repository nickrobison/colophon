/** @packageDocumentation Tests for table summary/aggregation utilities. */

import { useTable, type ColumnDef } from "@tanstack/react-table";
import { render, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { cphColumnHelper } from "./column";
import { cphTableFeatures, type CphTableFeatures } from "./features";
import {
  getAggregationValue,
  getSum,
  getMean,
  getCount,
  getFilteredTotal,
  getAggregationByKind,
} from "./summary";

// Test data type
interface TestRow {
  id: string;
  name: string;
  amount: number;
  category: string;
}

// Create a test table component that exposes the table instance
function TestTable({
  data,
  columns,
  onTableReady,
}: {
  data: TestRow[];
  columns: readonly ColumnDef<CphTableFeatures, TestRow>[];
  onTableReady: (table: ReturnType<typeof useTable<CphTableFeatures, TestRow>>) => void;
}) {
  const table = useTable({
    features: cphTableFeatures,
    columns,
    data,
    enableMultiSort: false,
  });

  // Call the callback with the table instance
  if (onTableReady) {
    onTableReady(table);
  }

  return null; // We only need the table instance for testing
}

describe("summary.ts - filter-aware aggregation", () => {
  // Create 15 test rows, 10 of which match the filter "category === 'A'"
  const testData: TestRow[] = [
    { id: "1", name: "Item 1", amount: 100, category: "A" },
    { id: "2", name: "Item 2", amount: 200, category: "A" },
    { id: "3", name: "Item 3", amount: 300, category: "A" },
    { id: "4", name: "Item 4", amount: 400, category: "A" },
    { id: "5", name: "Item 5", amount: 500, category: "A" },
    { id: "6", name: "Item 6", amount: 600, category: "A" },
    { id: "7", name: "Item 7", amount: 700, category: "A" },
    { id: "8", name: "Item 8", amount: 800, category: "A" },
    { id: "9", name: "Item 9", amount: 900, category: "A" },
    { id: "10", name: "Item 10", amount: 1000, category: "A" },
    { id: "11", name: "Item 11", amount: 100, category: "B" },
    { id: "12", name: "Item 12", amount: 200, category: "B" },
    { id: "13", name: "Item 13", amount: 300, category: "B" },
    { id: "14", name: "Item 14", amount: 400, category: "B" },
    { id: "15", name: "Item 15", amount: 500, category: "B" },
  ];

  const helper = cphColumnHelper<TestRow>();

  const columns = helper.columns([
    helper.accessor("id", {
      header: "ID",
      cell: (info) => info.getValue(),
    }),
    helper.accessor("name", {
      header: "Name",
      cell: (info) => info.getValue(),
    }),
    helper.accessor("amount", {
      header: "Amount",
      cell: (info) => info.getValue(),
      meta: {
        numeric: true,
        aggregate: "sum",
      },
    }),
    helper.accessor("category", {
      header: "Category",
      cell: (info) => info.getValue(),
    }),
  ]);

  it("getSum reflects ALL filtered rows (10) while page shows only 8", () => {
    let tableInstance: ReturnType<typeof useTable<CphTableFeatures, TestRow>> | null = null;

    // Render the test table to get the table instance
    const { unmount } = render(
      <TestTable
        data={testData}
        columns={columns}
        onTableReady={(table) => {
          tableInstance = table;
        }}
      />,
    );

    expect(tableInstance).not.toBeNull();
    const table = tableInstance!;

    // Apply a filter: category === "A" (should match 10 rows)
    act(() => {
      table.setColumnFilters([{ id: "category", value: "A" }]);
    });

    // Set page size to 8 (so only 8 rows visible per page)
    act(() => {
      table.setPageSize(8);
    });

    // Get the amount column
    const amountColumn = table.getColumn("amount");
    expect(amountColumn).not.toBeNull();

    // Get filtered rows (should be 10)
    const filteredRowModel = table.getFilteredRowModel();
    expect(filteredRowModel.rows.length).toBe(10);

    // Get paginated rows (should be 8 on first page)
    const paginatedRowModel = table.getRowModel();
    expect(paginatedRowModel.rows.length).toBe(8);

    // Get the sum using our helper with filtered rows
    const sum = getSum(amountColumn!, filteredRowModel.rows);

    // Sum of amounts for category A: 100+200+300+400+500+600+700+800+900+1000 = 5500
    expect(sum).toBe(5500);

    // Verify the sum is NOT just the current page (which would be 100+200+300+400+500+600+700+800 = 3600)
    expect(sum).not.toBe(3600);

    unmount();
  });

  it("getMean reflects ALL filtered rows", () => {
    let tableInstance: ReturnType<typeof useTable<CphTableFeatures, TestRow>> | null = null;

    const { unmount } = render(
      <TestTable
        data={testData}
        columns={columns}
        onTableReady={(table) => {
          tableInstance = table;
        }}
      />,
    );

    expect(tableInstance).not.toBeNull();
    const table = tableInstance!;

    act(() => {
      table.setColumnFilters([{ id: "category", value: "A" }]);
    });

    const amountColumn = table.getColumn("amount");
    expect(amountColumn).not.toBeNull();

    const filteredRowModel = table.getFilteredRowModel();
    const mean = getMean(amountColumn!, filteredRowModel.rows);

    // Mean of 100,200,300,400,500,600,700,800,900,1000 = 5500/10 = 550
    expect(mean).toBe(550);

    unmount();
  });

  it("getCount reflects ALL filtered rows", () => {
    let tableInstance: ReturnType<typeof useTable<CphTableFeatures, TestRow>> | null = null;

    const { unmount } = render(
      <TestTable
        data={testData}
        columns={columns}
        onTableReady={(table) => {
          tableInstance = table;
        }}
      />,
    );

    expect(tableInstance).not.toBeNull();
    const table = tableInstance!;

    act(() => {
      table.setColumnFilters([{ id: "category", value: "A" }]);
    });

    const amountColumn = table.getColumn("amount");
    expect(amountColumn).not.toBeNull();

    const filteredRowModel = table.getFilteredRowModel();
    const count = getCount(amountColumn!, filteredRowModel.rows);

    expect(count).toBe(10);

    unmount();
  });

  it("getFilteredTotal returns filtered count and total count", () => {
    let tableInstance: ReturnType<typeof useTable<CphTableFeatures, TestRow>> | null = null;

    const { unmount } = render(
      <TestTable
        data={testData}
        columns={columns}
        onTableReady={(table) => {
          tableInstance = table;
        }}
      />,
    );

    expect(tableInstance).not.toBeNull();
    const table = tableInstance!;

    // Before filtering
    let total = getFilteredTotal(table);
    expect(total.filtered).toBe(15);
    expect(total.total).toBe(15);

    // After filtering
    act(() => {
      table.setColumnFilters([{ id: "category", value: "A" }]);
    });

    total = getFilteredTotal(table);
    expect(total.filtered).toBe(10);
    expect(total.total).toBe(15);

    unmount();
  });

  it("getAggregationByKind dispatches to correct helper", () => {
    let tableInstance: ReturnType<typeof useTable<CphTableFeatures, TestRow>> | null = null;

    const { unmount } = render(
      <TestTable
        data={testData}
        columns={columns}
        onTableReady={(table) => {
          tableInstance = table;
        }}
      />,
    );

    expect(tableInstance).not.toBeNull();
    const table = tableInstance!;

    act(() => {
      table.setColumnFilters([{ id: "category", value: "A" }]);
    });

    const amountColumn = table.getColumn("amount");
    expect(amountColumn).not.toBeNull();

    const filteredRowModel = table.getFilteredRowModel();

    const sum = getAggregationByKind("sum", amountColumn!, filteredRowModel.rows);
    const mean = getAggregationByKind("mean", amountColumn!, filteredRowModel.rows);
    const count = getAggregationByKind("count", amountColumn!, filteredRowModel.rows);

    expect(sum).toBe(5500);
    expect(mean).toBe(550);
    expect(count).toBe(10);

    unmount();
  });

  it("getAggregationValue works with bare column and rows", () => {
    let tableInstance: ReturnType<typeof useTable<CphTableFeatures, TestRow>> | null = null;

    const { unmount } = render(
      <TestTable
        data={testData}
        columns={columns}
        onTableReady={(table) => {
          tableInstance = table;
        }}
      />,
    );

    expect(tableInstance).not.toBeNull();
    const table = tableInstance!;

    act(() => {
      table.setColumnFilters([{ id: "category", value: "A" }]);
    });

    const amountColumn = table.getColumn("amount");
    expect(amountColumn).not.toBeNull();

    const filteredRowModel = table.getFilteredRowModel();

    // Using the bare getAggregationValue directly
    const sum = getAggregationValue({
      column: amountColumn!,
      rows: filteredRowModel.rows,
    });

    expect(sum).toBe(5500);

    unmount();
  });

  it("aggregation without rows uses pre-grouped row model (all data)", () => {
    let tableInstance: ReturnType<typeof useTable<CphTableFeatures, TestRow>> | null = null;

    const { unmount } = render(
      <TestTable
        data={testData}
        columns={columns}
        onTableReady={(table) => {
          tableInstance = table;
        }}
      />,
    );

    expect(tableInstance).not.toBeNull();
    const table = tableInstance!;

    // No filter applied
    const amountColumn = table.getColumn("amount");
    expect(amountColumn).not.toBeNull();

    // Sum without rows parameter should use all data
    const sum = getSum(amountColumn!);

    // Sum of all 15 rows: 5500 (A) + 1500 (B) = 7000
    expect(sum).toBe(7000);

    unmount();
  });
});
