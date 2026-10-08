/** @packageDocumentation Controlled table state hooks. */

import { useState } from "react";

/**
 * Controlled state for expansion that only ever writes one expanded row.
 *
 * This enforces the single-row expansion rule by tracking which row is
 * expanded and providing a setter that replaces any previous expansion.
 */
export function useSingleRowExpansion() {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  return {
    expandedRowId,
    setExpandedRowId,
    toggleExpanded: (rowId: string) => {
      setExpandedRowId((current) => (current === rowId ? null : rowId));
    },
  };
}

/**
 * Controlled state for sorting that enforces single-column sort.
 *
 * The spec allows exactly one sort column at a time. This hook tracks
 * the sort key and direction, providing a setter that replaces any
 * previous sort state.
 */
export function useSingleColumnSort() {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  return {
    sortColumn,
    sortDirection,
    setSortColumn,
    setSortDirection,
    sort: (column: string, direction: "asc" | "desc" = "asc") => {
      setSortColumn(column);
      setSortDirection(direction);
    },
  };
}
