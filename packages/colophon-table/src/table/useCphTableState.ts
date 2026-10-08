/** @packageDocumentation Per-slice controlled state for TanStack Table v9. */

import { useState, useCallback, useMemo } from "react";
import type {
  SortingState,
  ColumnFiltersState,
  ColumnVisibilityState,
  ColumnPinningState,
  RowSelectionState,
  ExpandedState,
  PaginationState,
  OnChangeFn,
  Updater,
} from "@tanstack/react-table";

import type { CphTableFeatures } from "./features";

/**
 * Discriminated union for a single state slice.
 *
 * - Controlled: consumer owns the value and provides an `onChange` callback.
 *   The hook wires them straight through and keeps NO internal copy.
 * - Uncontrolled: hook owns the state internally; `initialValue` seeds it.
 */
type ControlledSlice<T> = {
  readonly controlled: true;
  readonly value: T;
  readonly onChange: OnChangeFn<T>;
};

type UncontrolledSlice<T> = {
  readonly controlled: false;
  readonly initialValue?: T;
};

export type StateSlice<T> = ControlledSlice<T> | UncontrolledSlice<T>;

/** Input options for {@link useCphTableState}. */
export interface UseCphTableStateOptions {
  /** Row sorting state (single-column sort enforced by `enableMultiSort: false`). */
  readonly sorting?: StateSlice<SortingState>;
  /** Column filter state. */
  readonly columnFilters?: StateSlice<ColumnFiltersState>;
  /** Column visibility state. */
  readonly columnVisibility?: StateSlice<ColumnVisibilityState>;
  /** Column pinning state (logical start/end). */
  readonly columnPinning?: StateSlice<ColumnPinningState>;
  /** Row selection state. */
  readonly rowSelection?: StateSlice<RowSelectionState>;
  /** Row expansion state. Single-row expansion is enforced when uncontrolled. */
  readonly expanded?: StateSlice<ExpandedState>;
  /** Pagination state. */
  readonly pagination?: StateSlice<PaginationState>;
}

/**
 * Return type for {@link useCphTableState}.
 *
 * Spread this into `useTable({ features: cphTableFeatures, columns, data, ...useCphTableState(...) })`.
 * Each slice appears exactly once: either in `state` + `onXChange` (controlled) or in `initialState` (uncontrolled).
 */
export interface UseCphTableStateReturn {
  /** Controlled state slices (only includes slices where `controlled: true`). */
  readonly state: Partial<{
    readonly sorting: SortingState;
    readonly columnFilters: ColumnFiltersState;
    readonly columnVisibility: ColumnVisibilityState;
    readonly columnPinning: ColumnPinningState;
    readonly rowSelection: RowSelectionState;
    readonly expanded: ExpandedState;
    readonly pagination: PaginationState;
  }>;
  /** Change callbacks for controlled slices (only included when controlled). */
  readonly onSortingChange?: OnChangeFn<SortingState>;
  readonly onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  readonly onColumnVisibilityChange?: OnChangeFn<ColumnVisibilityState>;
  readonly onColumnPinningChange?: OnChangeFn<ColumnPinningState>;
  readonly onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  readonly onExpandedChange?: OnChangeFn<ExpandedState>;
  readonly onPaginationChange?: OnChangeFn<PaginationState>;
  /** Uncontrolled initial state slices (only includes slices where `controlled: false`). */
  readonly initialState: Partial<{
    readonly sorting: SortingState;
    readonly columnFilters: ColumnFiltersState;
    readonly columnVisibility: ColumnVisibilityState;
    readonly columnPinning: ColumnPinningState;
    readonly rowSelection: RowSelectionState;
    readonly expanded: ExpandedState;
    readonly pagination: PaginationState;
  }>;
}

/**
 * Resolves a slice to its controlled value, consumer change handler, and initial value.
 *
 * @returns `[controlledValue, consumerChangeHandler, initialValue]` where exactly one of
 * `controlledValue`/`consumerChangeHandler` or `initialValue` is defined per slice.
 */
function resolveSlice<T>(
  slice: StateSlice<T> | undefined,
  defaultInitial: T,
): [
  controlledValue: T | undefined,
  consumerChangeHandler: OnChangeFn<T> | undefined,
  initialValue: T | undefined,
] {
  if (!slice) {
    return [undefined, undefined, defaultInitial];
  }
  if (slice.controlled) {
    return [slice.value, slice.onChange, undefined];
  }
  return [undefined, undefined, slice.initialValue ?? defaultInitial];
}

/**
 * Headless table state hook with per-slice controlled/uncontrolled support.
 *
 * Each of the seven state slices independently supports controlled OR uncontrolled use:
 * - Controlled: pass `{ controlled: true, value, onChange }` — hook yields to consumer, no internal state.
 * - Uncontrolled: pass `{ controlled: false, initialValue? }` — hook owns state internally.
 *
 * @example
 * ```tsx
 * // Fully uncontrolled
 * const tableState = useCphTableState({});
 *
 * // Controlled sorting + pagination, rest uncontrolled
 * const tableState = useCphTableState({
 *   sorting: { controlled: true, value: sorting, onChange: setSorting },
 *   pagination: { controlled: true, value: pagination, onChange: setPagination },
 * });
 *
 * // Controlled expansion with single-row enforcement
 * const tableState = useCphTableState({
 *   expanded: { controlled: true, value: expanded, onChange: setExpanded },
 * });
 * ```
 */
export function useCphTableState(
  options: UseCphTableStateOptions = {},
): UseCphTableStateReturn {
  const {
    sorting,
    columnFilters,
    columnVisibility,
    columnPinning,
    rowSelection,
    expanded,
    pagination,
  } = options;

  // Uncontrolled internal state (only used when slice is uncontrolled)
  const [internalSorting, setInternalSorting] = useState<SortingState>(() =>
    sorting?.controlled === false ? sorting.initialValue ?? [] : [],
  );
  const [internalColumnFilters, setInternalColumnFilters] = useState<ColumnFiltersState>(() =>
    columnFilters?.controlled === false ? columnFilters.initialValue ?? [] : [],
  );
  const [internalColumnVisibility, setInternalColumnVisibility] = useState<ColumnVisibilityState>(() =>
    columnVisibility?.controlled === false ? columnVisibility.initialValue ?? {} : {},
  );
  const [internalColumnPinning, setInternalColumnPinning] = useState<ColumnPinningState>(() =>
    columnPinning?.controlled === false ? columnPinning.initialValue ?? { start: [], end: [] } : { start: [], end: [] },
  );
  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>(() =>
    rowSelection?.controlled === false ? rowSelection.initialValue ?? {} : {},
  );
  const [internalExpanded, setInternalExpanded] = useState<ExpandedState>(() =>
    expanded?.controlled === false ? expanded.initialValue ?? {} : {},
  );
  const [internalPagination, setInternalPagination] = useState<PaginationState>(() =>
    pagination?.controlled === false ? pagination.initialValue ?? { pageIndex: 0, pageSize: 10 } : { pageIndex: 0, pageSize: 10 },
  );

  // Resolve each slice: controlled value, consumer handler, initial value
  const [
    controlledSorting,
    consumerOnSortingChange,
    initialSorting,
  ] = resolveSlice(sorting, []);

  const [
    controlledColumnFilters,
    consumerOnColumnFiltersChange,
    initialColumnFilters,
  ] = resolveSlice(columnFilters, []);

  const [
    controlledColumnVisibility,
    consumerOnColumnVisibilityChange,
    initialColumnVisibility,
  ] = resolveSlice(columnVisibility, {});

  const [
    controlledColumnPinning,
    consumerOnColumnPinningChange,
    initialColumnPinning,
  ] = resolveSlice(columnPinning, { start: [], end: [] });

  const [
    controlledRowSelection,
    consumerOnRowSelectionChange,
    initialRowSelection,
  ] = resolveSlice(rowSelection, {});

  const [
    controlledExpanded,
    consumerOnExpandedChange,
    initialExpanded,
  ] = resolveSlice(expanded, {});

  const [
    controlledPagination,
    consumerOnPaginationChange,
    initialPagination,
  ] = resolveSlice(pagination, { pageIndex: 0, pageSize: 10 });

  // Internal setters for uncontrolled slices (stable callbacks)
  const internalOnSortingChange = useCallback(
    (updaterOrValue: Updater<SortingState>) => {
      setInternalSorting((current: SortingState) =>
        typeof updaterOrValue === "function" ? updaterOrValue(current) : updaterOrValue,
      );
    },
    [],
  );

  const internalOnColumnFiltersChange = useCallback(
    (updaterOrValue: Updater<ColumnFiltersState>) => {
      setInternalColumnFilters((current: ColumnFiltersState) =>
        typeof updaterOrValue === "function" ? updaterOrValue(current) : updaterOrValue,
      );
    },
    [],
  );

  const internalOnColumnVisibilityChange = useCallback(
    (updaterOrValue: Updater<ColumnVisibilityState>) => {
      setInternalColumnVisibility((current: ColumnVisibilityState) =>
        typeof updaterOrValue === "function" ? updaterOrValue(current) : updaterOrValue,
      );
    },
    [],
  );

  const internalOnColumnPinningChange = useCallback(
    (updaterOrValue: Updater<ColumnPinningState>) => {
      setInternalColumnPinning((current: ColumnPinningState) =>
        typeof updaterOrValue === "function" ? updaterOrValue(current) : updaterOrValue,
      );
    },
    [],
  );

  const internalOnRowSelectionChange = useCallback(
    (updaterOrValue: Updater<RowSelectionState>) => {
      setInternalRowSelection((current: RowSelectionState) =>
        typeof updaterOrValue === "function" ? updaterOrValue(current) : updaterOrValue,
      );
    },
    [],
  );

  // Internal setter for expansion with single-row enforcement
  const internalOnExpandedChange = useCallback(
    (updaterOrValue: Updater<ExpandedState>) => {
      setInternalExpanded((current: ExpandedState) => {
        const next = typeof updaterOrValue === "function"
          ? updaterOrValue(current)
          : updaterOrValue;

        if (next === true) return true;
        if (typeof next === "object" && next !== null) {
          const record = next as Record<string, boolean>;
          const keys = Object.keys(record);
          const trueKeys = keys.filter((k) => record[k]);
          if (trueKeys.length > 1) {
            const lastKey = trueKeys[trueKeys.length - 1];
            if (lastKey !== undefined) {
              const singleExpansion: Record<string, boolean> = {};
              singleExpansion[lastKey] = true;
              return singleExpansion;
            }
          }
        }
        return next;
      });
    },
    [],
  );

  const internalOnPaginationChange = useCallback(
    (updaterOrValue: Updater<PaginationState>) => {
      setInternalPagination((current) =>
        typeof updaterOrValue === "function" ? updaterOrValue(current) : updaterOrValue,
      );
    },
    [],
  );

  // Public change handlers: use consumer's for controlled, internal for uncontrolled
  const onSortingChange = sorting?.controlled === true ? consumerOnSortingChange : internalOnSortingChange;
  const onColumnFiltersChange = columnFilters?.controlled === true ? consumerOnColumnFiltersChange : internalOnColumnFiltersChange;
  const onColumnVisibilityChange = columnVisibility?.controlled === true ? consumerOnColumnVisibilityChange : internalOnColumnVisibilityChange;
  const onColumnPinningChange = columnPinning?.controlled === true ? consumerOnColumnPinningChange : internalOnColumnPinningChange;
  const onRowSelectionChange = rowSelection?.controlled === true ? consumerOnRowSelectionChange : internalOnRowSelectionChange;
  const onExpandedChange = expanded?.controlled === true ? consumerOnExpandedChange : internalOnExpandedChange;
  const onPaginationChange = pagination?.controlled === true ? consumerOnPaginationChange : internalOnPaginationChange;

  // Build the return object with conditional spreads to satisfy exactOptionalPropertyTypes
  const state = useMemo(() => {
    const result: Partial<{
      sorting: SortingState;
      columnFilters: ColumnFiltersState;
      columnVisibility: ColumnVisibilityState;
      columnPinning: ColumnPinningState;
      rowSelection: RowSelectionState;
      expanded: ExpandedState;
      pagination: PaginationState;
    }> = {};
    if (controlledSorting !== undefined) result.sorting = controlledSorting;
    if (controlledColumnFilters !== undefined) result.columnFilters = controlledColumnFilters;
    if (controlledColumnVisibility !== undefined) result.columnVisibility = controlledColumnVisibility;
    if (controlledColumnPinning !== undefined) result.columnPinning = controlledColumnPinning;
    if (controlledRowSelection !== undefined) result.rowSelection = controlledRowSelection;
    if (controlledExpanded !== undefined) result.expanded = controlledExpanded;
    if (controlledPagination !== undefined) result.pagination = controlledPagination;
    return result;
  }, [
    controlledSorting,
    controlledColumnFilters,
    controlledColumnVisibility,
    controlledColumnPinning,
    controlledRowSelection,
    controlledExpanded,
    controlledPagination,
  ]);

  const initialState = useMemo(() => {
    const result: Partial<{
      sorting: SortingState;
      columnFilters: ColumnFiltersState;
      columnVisibility: ColumnVisibilityState;
      columnPinning: ColumnPinningState;
      rowSelection: RowSelectionState;
      expanded: ExpandedState;
      pagination: PaginationState;
    }> = {};
    if (initialSorting !== undefined) result.sorting = initialSorting;
    if (initialColumnFilters !== undefined) result.columnFilters = initialColumnFilters;
    if (initialColumnVisibility !== undefined) result.columnVisibility = initialColumnVisibility;
    if (initialColumnPinning !== undefined) result.columnPinning = initialColumnPinning;
    if (initialRowSelection !== undefined) result.rowSelection = initialRowSelection;
    if (initialExpanded !== undefined) result.expanded = initialExpanded;
    if (initialPagination !== undefined) result.pagination = initialPagination;
    return result;
  }, [
    initialSorting,
    initialColumnFilters,
    initialColumnVisibility,
    initialColumnPinning,
    initialRowSelection,
    initialExpanded,
    initialPagination,
  ]);

  return {
    state,
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange,
    onColumnPinningChange,
    onRowSelectionChange,
    onExpandedChange,
    onPaginationChange,
    initialState,
  };
}

/**
 * Dedicated hook for row selection state.
 *
 * Same controlled/uncontrolled contract as {@link useCphTableState}.
 *
 * @example
 * ```tsx
 * // Uncontrolled
 * const { state, onRowSelectionChange, initialState } = useCphRowSelection({});
 *
 * // Controlled
 * const { state, onRowSelectionChange } = useCphRowSelection({
 *   controlled: true,
 *   value: selection,
 *   onChange: setSelection,
 * });
 * ```
 */
export interface UseCphRowSelectionOptions {
  readonly controlled?: boolean;
  readonly value?: RowSelectionState;
  readonly onChange?: OnChangeFn<RowSelectionState>;
  readonly initialValue?: RowSelectionState;
}

export interface UseCphRowSelectionReturn {
  readonly state: { readonly rowSelection: RowSelectionState } | {};
  readonly onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  readonly initialState: { readonly rowSelection: RowSelectionState } | {};
}

export function useCphRowSelection(
  options: UseCphRowSelectionOptions = {},
): UseCphRowSelectionReturn {
  const { controlled = false, value, onChange, initialValue = {} } = options;

  const [internalSelection, setInternalSelection] = useState<RowSelectionState>(initialValue);

  if (controlled) {
    if (value === undefined || onChange === undefined) {
      throw new Error("useCphRowSelection: controlled mode requires both `value` and `onChange`");
    }
    return {
      state: { rowSelection: value },
      onRowSelectionChange: onChange,
      initialState: {},
    };
  }

  const internalOnRowSelectionChange = useCallback(
    (updaterOrValue: Updater<RowSelectionState>) => {
      setInternalSelection((current: RowSelectionState) =>
        typeof updaterOrValue === "function" ? updaterOrValue(current) : updaterOrValue,
      );
    },
    [],
  );

  return {
    state: {},
    onRowSelectionChange: internalOnRowSelectionChange,
    initialState: { rowSelection: internalSelection },
  };
}