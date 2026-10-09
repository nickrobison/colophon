import { useTable, type ColumnDef, type RowData, type TableState } from "@tanstack/react-table";

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
 *
 * The optional `selector` projects from the table store; the selected value
 * is exposed on `table.state` and subscribed for re-renders. Pass a narrow
 * selector (e.g. `(state) => ({ pagination: state.pagination })`) when you
 * only need one slice, such as wiring `CphPagination` to a live table.
 */
export function useCphTable<TData extends RowData, TSelected = TableState<CphTableFeatures>>(
  { data, columns, getRowId }: CphTableOptions<TData>,
  selector: (state: TableState<CphTableFeatures>) => TSelected = (state) => state as TSelected,
) {
  return useTable(
    {
      features: cphTableFeatures,
      columns,
      data,
      // Conditional spread, not `getRowId: getRowId` — under
      // exactOptionalPropertyTypes an explicit undefined is not assignable to an
      // optional prop, so passing the variable straight through would fail here.
      ...(getRowId ? { getRowId } : {}),
      enableMultiSort: false,
    },
    selector,
  );
}
