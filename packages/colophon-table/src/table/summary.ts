/** @packageDocumentation Table summary/aggregation utilities. */

import type {
  Column,
  Row,
  RowModel,
  Table,
  TableFeatures,
  RowData,
} from "@tanstack/react-table";

import type { CphTableFeatures } from "./features";

export type CphAggregateKind = "sum" | "mean" | "count";

export interface FilteredTotal {
  filtered: number;
  total: number;
}

export interface GetAggregationValueOptions<
  TFeatures extends TableFeatures,
  TData extends RowData,
  TValue = unknown,
> {
  column: Column<TFeatures, TData, TValue>;
  rows?: ReadonlyArray<Row<TFeatures, TData>> | undefined;
  maxDepth?: number | undefined;
}

export function getAggregationValue<
  TFeatures extends TableFeatures,
  TData extends RowData,
  TValue = unknown,
  TResult = unknown,
>(options: GetAggregationValueOptions<TFeatures, TData, TValue>): TResult {
  const { column, rows, maxDepth } = options;
  return column.getAggregationValue<TResult>({ rows, maxDepth });
}

export function getSum<
  TFeatures extends TableFeatures,
  TData extends RowData,
  TValue = unknown,
>(
  column: Column<TFeatures, TData, TValue>,
  rows?: ReadonlyArray<Row<TFeatures, TData>>,
): number | undefined {
  return getAggregationValue<TFeatures, TData, TValue, number | undefined>({
    column,
    rows,
  });
}

export function getMean<
  TFeatures extends TableFeatures,
  TData extends RowData,
  TValue = unknown,
>(
  column: Column<TFeatures, TData, TValue>,
  rows?: ReadonlyArray<Row<TFeatures, TData>>,
): number | undefined {
  return getAggregationValue<TFeatures, TData, TValue, number | undefined>({
    column,
    rows,
  });
}

export function getCount<
  TFeatures extends TableFeatures,
  TData extends RowData,
  TValue = unknown,
>(
  column: Column<TFeatures, TData, TValue>,
  rows?: ReadonlyArray<Row<TFeatures, TData>>,
): number {
  return getAggregationValue<TFeatures, TData, TValue, number>({
    column,
    rows,
  });
}

export function getFilteredTotal<
  TFeatures extends TableFeatures,
  TData extends RowData,
>(table: Table<TFeatures, TData>): FilteredTotal {
  const filteredRowModel = table.getFilteredRowModel();
  const coreRowModel = table.getCoreRowModel();
  return {
    filtered: filteredRowModel.rows.length,
    total: coreRowModel.rows.length,
  };
}

export function getAggregationByKind<
  TFeatures extends TableFeatures,
  TData extends RowData,
  TValue = unknown,
>(
  kind: CphAggregateKind,
  column: Column<TFeatures, TData, TValue>,
  rows?: ReadonlyArray<Row<TFeatures, TData>>,
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
