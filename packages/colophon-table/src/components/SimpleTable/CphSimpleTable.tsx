/** @packageDocumentation Simple generic sortable/selectable data table. */

import type { ColumnDef, RowSelectionState, SortingState, TableState } from "@tanstack/react-table";
import { useMemo, type ReactNode } from "react";
import type { Selection, SortDescriptor } from "react-aria-components";

import { cphColumnHelper, type CphColumnMeta } from "../../table/column";
import type { CphTableFeatures } from "../../table/features";
import { useCphTable } from "../../table/useCphTable";
import type { StateSlice } from "../../table/useCphTableState";
import { CphTableEmpty } from "../CphTableEmpty";
import { CphDataTable } from "../DataTable/CphDataTable";
import {
  CphCursorPagination,
  type CphCursorPaginationProps,
} from "../Pagination/CphCursorPagination";
import { CphTableHead, type CphTableHeadSelectAll } from "../TableHead/CphTableHead";
import { Cell } from "../TableRow/Cell";
import { CphTableRow } from "../TableRow/CphTableRow";

/** Stable column id for the internal selection column. */
const SELECT_COLUMN_ID = "__selection__";

/**
 * Column definition for {@link CphSimpleTable}.
 *
 * Presentation-only: the sort key comes from `sortValue` (falling back to
 * `accessor`), and display values come from `accessor`.
 */
export interface CphSimpleTableColumn<T> {
  /** Stable column id, also used as the sort key. */
  id: string;
  /** Header content. */
  header: ReactNode;
  /** Cell display value. */
  accessor?: (row: T) => ReactNode;
  /**
   * Sort key; falls back to `accessor`. Non-scalar display values should
   * provide this (e.g. a primitive extracted from the displayed value).
   */
  sortValue?: (row: T) => string | number | boolean | null | undefined;
  /** Whether this column can be sorted. Defaults to true when sortValue/accessor exists. */
  allowsSorting?: boolean;
  /** Text alignment for header and cells. */
  align?: "left" | "right";
  /** Escape hatch for column presentation (e.g. widthClass) not modeled here. */
  meta?: CphColumnMeta;
}

export interface CphSimpleTableProps<T extends { id: string | number }> {
  /** Accessible name for the table. */
  "aria-label"?: string;
  /** Column definitions. */
  columns: CphSimpleTableColumn<T>[];
  /** Row data. Each row must have a stable id. */
  rows: T[];
  /** Selection mode. Omit or "none" for a non-selectable table. */
  selectionMode?: "none" | "single" | "multiple";
  /** Controlled selected keys. */
  selectedKeys?: Selection;
  /** Controlled selection change handler. */
  onSelectionChange?: (keys: Selection) => void;
  /** Uncontrolled initial selected keys. */
  defaultSelectedKeys?: Selection;
  /** Controlled sort descriptor. */
  sortDescriptor?: SortDescriptor;
  /** Controlled sort change handler. */
  onSortChange?: (descriptor: SortDescriptor) => void;
  /** Uncontrolled initial sort descriptor. */
  defaultSortDescriptor?: SortDescriptor;
  /** Cursor pagination controls. */
  pagination?: CphCursorPaginationProps;
  /** Optional class name for the outer wrap. */
  className?: string;
}

function selectionToState(
  selection: Selection | undefined,
  rows: { id: string | number }[],
): RowSelectionState {
  const state: RowSelectionState = {};
  if (selection === undefined) {
    return state;
  }
  const ids = selection === "all" ? rows.map((row) => String(row.id)) : [...selection].map(String);
  for (const id of ids) {
    state[id] = true;
  }
  return state;
}

function selectionToKeys(state: RowSelectionState, rows: { id: string | number }[]): Selection {
  const selected = new Set<string>();
  for (const key of Object.keys(state)) {
    if (state[key]) {
      selected.add(key);
    }
  }
  if (rows.length > 0) {
    const allSelected =
      selected.size > 0 &&
      [...new Set(rows.map((row) => String(row.id)))].every((id) => selected.has(id));
    if (allSelected) {
      return "all";
    }
  }
  return selected;
}

/**
 * Generic simple data table: consumer-supplied columns/rows with TanStack
 * sorting, checkbox selection, and cursor pagination — rendered through the
 * package's existing plain-HTML table primitives.
 */
export function CphSimpleTable<T extends { id: string | number }>({
  "aria-label": ariaLabel,
  columns,
  rows,
  selectionMode = "none",
  selectedKeys,
  onSelectionChange,
  defaultSelectedKeys,
  sortDescriptor,
  onSortChange,
  defaultSortDescriptor,
  pagination,
  className,
}: CphSimpleTableProps<T>) {
  const isSelectionEnabled = selectionMode !== "none";
  const isSortControlled = sortDescriptor !== undefined || onSortChange !== undefined;
  const isSelectionControlled = selectedKeys !== undefined || onSelectionChange !== undefined;

  const tanstackColumns: ColumnDef<CphTableFeatures, T, unknown>[] = useMemo(() => {
    const helper = cphColumnHelper<T>();
    const built: ColumnDef<CphTableFeatures, T, unknown>[] = [];

    if (isSelectionEnabled) {
      built.push(
        helper.display({
          id: SELECT_COLUMN_ID,
          header: "",
          meta: { widthClass: "select" },
        }),
      );
    }

    for (const column of columns) {
      const sortable = column.allowsSorting ?? Boolean(column.sortValue ?? column.accessor);
      const meta: CphColumnMeta = {
        ...(column.align ? { align: column.align } : undefined),
        ...(column.meta ?? undefined),
      };

      if (!sortable) {
        built.push(
          helper.display({
            id: column.id,
            header: String(column.header ?? ""),
            ...(meta ? { meta } : {}),
          }),
        );
        continue;
      }

      const accessorFn = (row: T): unknown =>
        column.sortValue
          ? column.sortValue(row)
          : column.accessor
            ? column.accessor(row)
            : undefined;

      built.push(
        helper.accessor(accessorFn, {
          id: column.id,
          header: String(column.header ?? ""),
          enableSorting: true,
          ...(meta ? { meta } : {}),
        }),
      );
    }

    return built;
  }, [columns, isSelectionEnabled]);

  const sortingSlice: StateSlice<SortingState> = isSortControlled
    ? {
        controlled: true,
        value: sortDescriptor
          ? [{ id: String(sortDescriptor.column), desc: sortDescriptor.direction === "descending" }]
          : [],
        onChange: (updater) => {
          const next = typeof updater === "function" ? updater(table.state.sorting) : updater;
          const nextDescriptor: SortDescriptor | undefined = next[0]
            ? { column: next[0].id, direction: next[0].desc ? "descending" : "ascending" }
            : undefined;
          if (nextDescriptor) {
            onSortChange?.(nextDescriptor);
          }
        },
      }
    : {
        controlled: false,
        initialValue: defaultSortDescriptor
          ? [
              {
                id: String(defaultSortDescriptor.column),
                desc: defaultSortDescriptor.direction === "descending",
              },
            ]
          : [],
      };

  const selectionSlice: StateSlice<RowSelectionState> = isSelectionControlled
    ? {
        controlled: true,
        value: selectionToState(selectedKeys, rows),
        onChange: (updater) => {
          const next = typeof updater === "function" ? updater(table.state.rowSelection) : updater;
          onSelectionChange?.(selectionToKeys(next, rows));
        },
      }
    : {
        controlled: false,
        initialValue: selectionToState(defaultSelectedKeys, rows),
      };

  const table = useCphTable<T, TableState<CphTableFeatures>>({
    data: rows,
    columns: tanstackColumns,
    getRowId: (row) => String(row.id),
    enableSortingRemoval: false,
    ...(selectionMode === "single" ? { enableMultiRowSelection: false } : {}),
    sorting: sortingSlice,
    rowSelection: selectionSlice,
  });

  const renderedRows = table.getRowModel().rows;
  const isEmpty = renderedRows.length === 0;
  const allSelected = table.getIsAllRowsSelected();
  const someSelected = table.getIsSomeRowsSelected();

  const selectAll: CphTableHeadSelectAll | undefined = isSelectionEnabled
    ? {
        columnId: SELECT_COLUMN_ID,
        checked: allSelected,
        indeterminate: someSelected && !allSelected,
        onChange: (checked) => {
          table.toggleAllRowsSelected(checked);
        },
      }
    : undefined;

  const content = isEmpty ? (
    <CphTableEmpty
      message="No results"
      visibleColumnCount={columns.length + (isSelectionEnabled ? 1 : 0)}
    />
  ) : (
    <tbody>
      {renderedRows.map((row) => {
        const rowId = row.id;
        const isRowSelected = row.getIsSelected();
        return (
          <CphTableRow
            key={rowId}
            className="cph-table__row"
            data-selected={isRowSelected ? "true" : undefined}
          >
            {isSelectionEnabled && (
              <Cell className="cph-table__selection-cell">
                <input
                  type="checkbox"
                  className="cph-table__checkbox"
                  aria-label={`Select row ${rowId}`}
                  checked={isRowSelected}
                  onChange={() => row.toggleSelected()}
                />
              </Cell>
            )}
            {columns.map((column) => {
              const value: ReactNode = column.accessor
                ? column.accessor(row.original)
                : ((row.original as Record<string, unknown>)[column.id] as ReactNode);
              return (
                <Cell
                  key={column.id}
                  columnId={column.id}
                  numeric={column.meta?.numeric}
                  align={column.align}
                >
                  {value}
                </Cell>
              );
            })}
          </CphTableRow>
        );
      })}
    </tbody>
  );

  const showPagination =
    pagination !== undefined &&
    (pagination.onNextPage !== undefined ||
      pagination.onPreviousPage !== undefined ||
      pagination.hasNextPage !== undefined ||
      pagination.hasPreviousPage !== undefined ||
      pagination.startCursor !== undefined ||
      pagination.endCursor !== undefined);

  const dataTableProps = {
    table,
    showSummary: false,
    className: className ? `cph-table-simple ${className}` : "cph-table-simple",
    ...(ariaLabel !== undefined ? { tableLabel: ariaLabel } : {}),
  };

  return (
    <>
      <CphDataTable {...dataTableProps}>
        <CphTableHead table={table} selectAll={selectAll} />
        {content}
      </CphDataTable>
      {showPagination && pagination ? (
        <CphCursorPagination
          hasNextPage={pagination.hasNextPage}
          hasPreviousPage={pagination.hasPreviousPage}
          startCursor={pagination.startCursor}
          endCursor={pagination.endCursor}
          isLoading={pagination.isLoading}
          onNextPage={pagination.onNextPage}
          onPreviousPage={pagination.onPreviousPage}
        />
      ) : null}
    </>
  );
}
