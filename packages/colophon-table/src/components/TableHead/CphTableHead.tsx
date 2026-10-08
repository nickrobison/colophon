/** @packageDocumentation Table header component rendering TanStack header groups. */

import { type ReactNode } from "react";
import type { Table, RowData } from "@tanstack/react-table";

import { HeaderCell, type HeaderCellHeader, type HeaderCellColumn } from "./HeaderCell";
import type { CphTableFeatures } from "../../table/features";

export interface CphTableHeadProps<TData extends RowData> {
  /** The TanStack table instance. */
  table: Table<CphTableFeatures, TData>;
  /** Optional additional content (e.g., custom header rows). */
  children?: ReactNode;
}

/**
 * Renders all header groups from the table instance.
 *
 * Each header group becomes a `<tr>` containing {@link HeaderCell} components
 * for each visible leaf header in that group. The header cells receive their
 * sorting, pinning, and selection state from the TanStack header instance.
 */
export function CphTableHead<TData extends RowData>({ table, children }: CphTableHeadProps<TData>) {
  const headerGroups = table.getHeaderGroups();

  return (
    <thead data-cph-table="thead">
      {headerGroups.map((headerGroup) => (
        <tr key={headerGroup.id} data-cph-table="header-group">
          {headerGroup.headers.map((header) => {
            if (header.isPlaceholder) {
              return <th key={header.placeholderId ?? header.id} data-cph-table="placeholder" />;
            }

            const column = header.column;
            const canSort = column.getCanSort();
            const isSorted = column.getIsSorted();
            const sortDirection = isSorted ? (column.getSortIndex() === 0 ? (column.getIsSorted() === "asc" ? "asc" : "desc") : undefined) : undefined;
            const pinned = column.getIsPinned();
            const canPin = column.getCanPin();
            const isLastPinned = pinned === "start" && column.getIsLastColumn("start");

            // Narrow header/column to minimal interfaces for HeaderCell
            const headerCellHeader: HeaderCellHeader = {
              id: header.id,
              isPlaceholder: header.isPlaceholder,
              placeholderId: header.placeholderId,
            };
            const headerCellColumn: HeaderCellColumn = {
              getCanSort: column.getCanSort.bind(column),
              getIsSorted: column.getIsSorted.bind(column),
              getSortIndex: column.getSortIndex.bind(column),
              getIsPinned: column.getIsPinned.bind(column),
              getCanPin: column.getCanPin.bind(column),
              getIsLastColumn: column.getIsLastColumn.bind(column),
              toggleSorting: column.toggleSorting.bind(column),
              pin: column.pin.bind(column),
            };

            return (
              <HeaderCell
                key={header.id}
                header={headerCellHeader}
                column={headerCellColumn}
                canSort={canSort}
                sortDirection={sortDirection}
                pinned={pinned}
                canPin={canPin}
                isLastPinned={isLastPinned}
                children={header.getContext().column.columnDef.header as ReactNode}
              />
            );
          })}
        </tr>
      ))}
      {children}
    </thead>
  );
}