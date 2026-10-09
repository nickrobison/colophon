import {
  columnFilteringFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  createExpandedRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowAggregationFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_text,
  aggregationFn_count,
  aggregationFn_extent,
  aggregationFn_mean,
  aggregationFn_sum,
  tableFeatures,
} from "@tanstack/react-table";

import type { CphColumnMeta } from "./column";

/**
 * The table's feature registry.
 *
 * This MUST stay at module scope: TanStack reads it for type inference and for
 * feature-slot validation, and rebuilding it per render re-validates the whole
 * object on every frame.
 *
 * Two spec rules are enforced here rather than at each call site:
 * `enableMultiSort` and `expandSingleRowOnly` are set in {@link useCphTable}.
 */
export const cphTableFeatures = tableFeatures({
  columnFilteringFeature,
  columnOrderingFeature,
  columnPinningFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  rowAggregationFeature,
  rowExpandingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,

  sortedRowModel: createSortedRowModel(),
  filteredRowModel: createFilteredRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  expandedRowModel: createExpandedRowModel(),

  sortFns: { alphanumeric: sortFn_alphanumeric, text: sortFn_text },
  filterFns: { includesString: filterFn_includesString },
  aggregationFns: {
    sum: aggregationFn_sum,
    mean: aggregationFn_mean,
    count: aggregationFn_count,
    extent: aggregationFn_extent,
  },

  columnMeta: {} as CphColumnMeta,
});

export type CphTableFeatures = typeof cphTableFeatures;
