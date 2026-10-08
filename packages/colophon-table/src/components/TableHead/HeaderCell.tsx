/** @packageDocumentation Individual header cell with sorting, pinning, and selection. */

import type { ColumnPinningPosition } from "@tanstack/react-table";
import { useRef, useEffect, type ReactNode } from "react";

import { usePinnedOffset } from "../DataTable/CphDataTable";

/** Minimal header interface for HeaderCell — only the properties/methods we actually use. */
export interface HeaderCellHeader {
  id: string;
  isPlaceholder: boolean;
  placeholderId?: string | undefined;
}

/** Minimal column interface for HeaderCell — only the methods we actually call. */
export interface HeaderCellColumn {
  getCanSort: () => boolean;
  getIsSorted: () => boolean | "asc" | "desc";
  getSortIndex: () => number;
  getIsPinned: () => ColumnPinningPosition;
  getCanPin: () => boolean;
  getIsLastColumn: (position?: ColumnPinningPosition | "center") => boolean;
  toggleSorting: () => void;
  pin: (position: ColumnPinningPosition) => void;
}

export interface HeaderCellProps {
  /** The TanStack header instance (minimal shape). */
  header: HeaderCellHeader;
  /** The TanStack column instance (minimal shape). */
  column: HeaderCellColumn;
  /** Whether this column can be sorted. */
  canSort: boolean;
  /** Current sort direction: "asc", "desc", or undefined for unsorted. */
  sortDirection: "asc" | "desc" | undefined;
  /** Pin state: "start", "end", or undefined. */
  pinned: "start" | "end" | false | undefined;
  /** Whether this column can be pinned. */
  canPin: boolean;
  /** Whether this is the last start-pinned column. */
  isLastPinned: boolean;
  /** Optional select-all checkbox state. */
  selectAll?: boolean;
  /** Optional indeterminate state for select-all. */
  selectAllIndeterminate?: boolean;
  /** Header label/content. */
  children: ReactNode;
  /** Additional className (string or React Aria render-props callback). */
  className?: string | ((values: { defaultClassName: string | undefined }) => string) | undefined;
}

/**
 * Sort arrow glyph only — no words like "ascending" in the arrow.
 */
function SortArrow({ direction }: { direction: "asc" | "desc" | undefined }) {
  if (direction === "asc")
    return (
      <span className="cph-table__sort-arrow" aria-hidden="true">
        ▲
      </span>
    );
  if (direction === "desc")
    return (
      <span className="cph-table__sort-arrow" aria-hidden="true">
        ▼
      </span>
    );
  return <span className="cph-table__sort-arrow" aria-hidden="true" />;
}

/**
 * Pin toggle button — calls column.pin('start') / column.pin(false).
 */
function PinToggle({
  column,
  pinned,
  canPin,
}: {
  column: HeaderCellColumn;
  pinned: "start" | "end" | false | undefined;
  canPin: boolean;
}) {
  if (!canPin) return null;

  const isPinned = pinned === "start";
  return (
    <button
      type="button"
      className="cph-table__pin-toggle"
      aria-label={isPinned ? "Unpin column" : "Pin column"}
      aria-pressed={isPinned}
      onClick={() => column.pin(isPinned ? false : "start")}
    >
      {isPinned ? "📌" : "📍"}
    </button>
  );
}

export function HeaderCell({
  header,
  column,
  canSort,
  sortDirection,
  pinned,
  canPin,
  selectAll,
  selectAllIndeterminate,
  children,
  className,
}: HeaderCellProps) {
  const checkboxRef = useRef<HTMLInputElement>(null);
  const offset = usePinnedOffset(header.id);

  // Handle indeterminate via ref callback (React has no indeterminate prop)
  useEffect(() => {
    if (checkboxRef.current && selectAllIndeterminate !== undefined) {
      checkboxRef.current.indeterminate = selectAllIndeterminate;
    }
  }, [selectAllIndeterminate]);

  const isPinnedStart = pinned === "start";
  const pinnedStyle = isPinnedStart && offset ? { left: `${offset.left}px` } : undefined;

  // Build className: base + pinned classes + custom className
  const baseClasses = ["cph-table__header-cell"];
  if (isPinnedStart) {
    baseClasses.push("cph-table__pinned", "cph-table__pinned-head");
  }
  const baseClass = baseClasses.join(" ");

  // For native elements, we need a string className.
  // If className is a function (render-props), we can't use it directly on native elements.
  // We'll call it with minimal render props if it's a function.
  let composedClassName: string;
  if (typeof className === "function") {
    composedClassName = `${baseClass} ${className({ defaultClassName: undefined })}`;
  } else {
    composedClassName = className ? `${baseClass} ${className}` : baseClass;
  }

  // aria-sort: ONLY when sorted — "ascending" / "descending".
  // When unsorted the attribute must be ABSENT from the DOM, never "none".
  const ariaSort =
    sortDirection === "asc" ? "ascending" : sortDirection === "desc" ? "descending" : undefined;

  // For placeholder headers, render empty th
  if (header.isPlaceholder) {
    return (
      <th
        key={header.placeholderId ?? header.id}
        className={composedClassName}
        data-cph-table="placeholder"
      />
    );
  }

  return (
    <th
      className={composedClassName}
      style={pinnedStyle}
      data-cph-table="header-cell"
      data-sort={sortDirection}
      data-pinned={pinned}
      aria-sort={ariaSort}
    >
      <div className="cph-table__header-cell-content">
        {selectAll !== undefined && (
          <input
            ref={checkboxRef}
            type="checkbox"
            className="cph-table__checkbox"
            checked={selectAll}
            aria-label="Select all rows"
            readOnly
          />
        )}

        {canSort ? (
          <button
            type="button"
            className="cph-table__sort"
            onClick={() => column.toggleSorting()}
            aria-label={`Sort ${sortDirection === "asc" ? "descending" : "ascending"}`}
          >
            <span className="cph-table__sort-label">{children}</span>
            <SortArrow direction={sortDirection} />
          </button>
        ) : (
          <span className="cph-table__sort-label">{children}</span>
        )}

        <PinToggle column={column} pinned={pinned} canPin={canPin} />
      </div>
    </th>
  );
}
