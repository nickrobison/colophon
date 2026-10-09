/** @packageDocumentation Table summary/aggregation utilities. */

import { type Column, type Row, type Table, type RowData } from "@tanstack/react-table";

import type { CphTableFeatures } from "./features";

export type CphAggregateKind = "sum" | "mean" | "count";

export interface FilteredTotal {
  filtered: number;
  total: number;
}

export interface GetAggregationValueOptions<TData extends RowData, TValue = unknown> {
  column: Column<CphTableFeatures, TData, TValue>;
  rows?: ReadonlyArray<Row<CphTableFeatures, TData>> | undefined;
  maxDepth?: number | undefined;
}

export function getAggregationValue<TData extends RowData, TValue = unknown, TResult = unknown>(
  options: GetAggregationValueOptions<TData, TValue>,
): TResult {
  const { column, rows, maxDepth } = options;
  return column.getAggregationValue<TResult>({
    ...(rows !== undefined ? { rows } : {}),
    ...(maxDepth !== undefined ? { maxDepth } : {}),
  });
}

export function getSum<TData extends RowData, TValue = unknown>(
  column: Column<CphTableFeatures, TData, TValue>,
  rows?: ReadonlyArray<Row<CphTableFeatures, TData>>,
): number | undefined {
  if (rows === undefined) return column.getAggregationValue<number | undefined>();
  return rows.reduce((sum, row) => {
    const value = row.getValue(column.id);
    return sum + (typeof value === "number" ? value : 0);
  }, 0);
}

export function getMean<TData extends RowData, TValue = unknown>(
  column: Column<CphTableFeatures, TData, TValue>,
  rows?: ReadonlyArray<Row<CphTableFeatures, TData>>,
): number | undefined {
  if (rows === undefined) return column.getAggregationValue<number | undefined>();
  let count = 0;
  let sum = 0;
  for (const row of rows) {
    const value = row.getValue(column.id);
    if (value == null) continue;
    const numericValue = typeof value === "number" ? value : Number(value);
    if (!Number.isNaN(numericValue)) {
      count += 1;
      sum += numericValue;
    }
  }
  return count > 0 ? sum / count : undefined;
}

export function getCount<TData extends RowData, TValue = unknown>(
  column: Column<CphTableFeatures, TData, TValue>,
  rows?: ReadonlyArray<Row<CphTableFeatures, TData>>,
): number {
  if (rows === undefined) return column.getAggregationValue<number>();
  return rows.length;
}

export function getFilteredTotal<TData extends RowData>(
  table: Table<CphTableFeatures, TData>,
): FilteredTotal {
  const filteredRowModel = table.getFilteredRowModel();
  const coreRowModel = table.getCoreRowModel();
  return {
    filtered: filteredRowModel.rows.length,
    total: coreRowModel.rows.length,
  };
}

export function getAggregationByKind<TData extends RowData, TValue = unknown>(
  kind: CphAggregateKind,
  column: Column<CphTableFeatures, TData, TValue>,
  rows?: ReadonlyArray<Row<CphTableFeatures, TData>>,
): number | undefined {
  switch (kind) {
    case "sum":
      return getSum(column, rows);
    case "mean":
      return getMean(column, rows);
    case "count":
      return getCount(column, rows);
    default:
      return undefined;
  }
}
