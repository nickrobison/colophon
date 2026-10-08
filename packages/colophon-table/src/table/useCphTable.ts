import { useTable, type ColumnDef, type RowData } from "@tanstack/react-table";

import { cphTableFeatures, type CphTableFeatures } from "./features";

export interface CphTableOptions<TData extends RowData> {
  data: TData[];
  columns: ColumnDef<CphTableFeatures, TData, unknown>[];
  /** Stable row identity; required for selection and expansion to survive re-sorts. */
  getRowId?: (row: TData, index: number) => string;
}

/**
 * Headless table instance.
 *
 * `enableMultiSort: false` is a spec rule, not a preference: the Tables Spec
 * allows exactly one sort column at a time.
 *
 * v9 removed `expandSingleRowOnly`, so single-row expansion is enforced one
 * level up in `useCphTableState`, which only ever writes one expanded id.
 */
export function useCphTable<TData extends RowData>({
  data,
  columns,
  getRowId,
}: CphTableOptions<TData>) {
  return useTable({
    features: cphTableFeatures,
    columns,
    data,
    // Conditional spread, not `getRowId: getRowId` — under
    // exactOptionalPropertyTypes an explicit undefined is not assignable to an
    // optional prop, so passing the variable straight through would fail here.
    ...(getRowId ? { getRowId } : {}),
    enableMultiSort: false,
  });
}
