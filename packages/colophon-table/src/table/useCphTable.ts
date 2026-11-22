import {
  useTable,
  type ColumnDef,
  type RowData,
  type RowSelectionState,
  type SortingState,
  type TableState,
} from "@tanstack/react-table";

import { cphTableFeatures, type CphTableFeatures } from "./features";
import { useCphTableState, type StateSlice } from "./useCphTableState";

export interface CphTableOptions<TData extends RowData> {
  data: TData[];
  columns: ColumnDef<CphTableFeatures, TData, unknown>[];
  /** Stable row identity; required for selection and expansion to survive re-sorts. */
  getRowId?: (row: TData, index: number) => string;
  /**
   * Enables/Disables the ability to remove sorting.
   *
   * - `true`  → sort cycle: "none" → "desc" → "asc" → "none" → …
   * - `false` → sort cycle: "none" → first direction → flip → flip → …
   *   (the two-state asc↔desc cycle; TanStack defaults to `true`)
   *
   * Colophon's tables spec mandates the two-state cycle, so the headless hook
   * passes `false` unless a consumer opts into removal.
   */
  enableSortingRemoval?: boolean;
  /**
   * Enables multi-row selection. Disable for `selectionMode: "single"` tables
   * so TanStack enforces at most one selected row.
   */
  enableMultiRowSelection?: boolean;
  /** Controlled/uncontrolled row sorting slice. */
  sorting?: StateSlice<SortingState>;
  /** Controlled/uncontrolled row selection slice. */
  rowSelection?: StateSlice<RowSelectionState>;
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
  {
    data,
    columns,
    getRowId,
    enableSortingRemoval = false,
    enableMultiRowSelection,
    sorting,
    rowSelection,
  }: CphTableOptions<TData>,
  selector: (state: TableState<CphTableFeatures>) => TSelected = (state) => state as TSelected,
) {
  const tableState = useCphTableState({
    ...(sorting !== undefined ? { sorting } : {}),
    ...(rowSelection !== undefined ? { rowSelection } : {}),
  });

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
      // Two-state sort cycle (unsorted → asc → desc → …): sorting can never be
      // removed back to "unsorted" once a column has been sorted.
      enableSortingRemoval,
      // Conditional spread for the optional single/multi toggle.
      ...(enableMultiRowSelection === undefined ? {} : { enableMultiRowSelection }),
      ...tableState,
    },
    selector,
  );
}
