/** @packageDocumentation The main table container component. */

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Table, RowData, ColumnPinningPosition } from "@tanstack/react-table";

import { computePinnedOffsets, type PinnedOffsetEntry, type PinnedOffsetHeader } from "./pinnedOffsets";
import type { CphTableFeatures } from "../../table/features";
import type { CphColumnMeta } from "../../table/column";

export interface CphDataTableProps<TData extends RowData> extends React.HTMLAttributes<HTMLDivElement> {
  /** The TanStack table instance. */
  table: Table<CphTableFeatures, TData>;
  /** Header and row content (typically CphTableHead, CphTableBody, etc.). */
  children: ReactNode;
  /** Show summary footer when true. */
  showSummary?: boolean;
}

/** Context value for pinned column offsets. */
export interface PinnedOffsetsContextValue {
  offsets: ReadonlyMap<string, PinnedOffsetEntry>;
}

const PinnedOffsetsContext = createContext<PinnedOffsetsContextValue | null>(null);

/**
 * Consumes the pinned-offsets context published by {@link CphDataTable}.
 * Returns the offset entry for the given header id, or undefined if not pinned.
 */
export function usePinnedOffset(headerId: string): PinnedOffsetEntry | undefined {
  const ctx = useContext(PinnedOffsetsContext);
  return ctx?.offsets.get(headerId);
}

/**
 * Scrollable table container with pinned column support.
 *
 * Renders:
 *   <div class="cph-table-root">
 *     <div class="cph-table-scroll">
 *       <table class="cph-table">
 *         <colgroup> — one <col> per visible leaf column
 *         {children} — header, body, footer
 *       </table>
 *     </div>
 *   </div>
 *
 * Pinned column offsets are computed from start-pinned leaf headers and
 * published via {@link PinnedOffsetsContext} so {@link HeaderCell} can read
 * its own `left` without prop drilling.
 */
export function CphDataTable<TData extends RowData>({
  table,
  children,
  showSummary: _showSummary,
  className,
  ...props
}: CphDataTableProps<TData>) {
  // Collect all visible leaf columns in visual order: start, center, end
  const visibleLeafColumns = useMemo(() => [
    ...table.getStartVisibleLeafColumns(),
    ...table.getCenterVisibleLeafColumns(),
    ...table.getEndVisibleLeafColumns(),
  ], [table]);

  // Get start-pinned leaf headers for offset computation
  const startLeafHeaders = useMemo(() => table.getStartLeafHeaders(), [table]);

  // Map TanStack headers to our minimal interface for offset computation
  const offsetHeaders = useMemo(() => startLeafHeaders.map((header): PinnedOffsetHeader => ({
    id: header.id,
    getSize: () => header.getSize(),
    column: {
      getIsPinned: () => header.column.getIsPinned(),
      getIsLastColumn: (position?: ColumnPinningPosition | "center") => header.column.getIsLastColumn(position),
    },
  })), [startLeafHeaders]);

  // Compute pinned offsets and publish via context
  const pinnedOffsets = useMemo(
    () => computePinnedOffsets(offsetHeaders),
    [offsetHeaders],
  );

  const contextValue = useMemo(
    () => ({ offsets: pinnedOffsets }),
    [pinnedOffsets],
  );

  return (
    <PinnedOffsetsContext.Provider value={contextValue}>
      <div {...props} className={`cph-table-root ${className ?? ""}`}>
        <div className="cph-table-scroll">
          <table className="cph-table">
            <colgroup>
              {visibleLeafColumns.map((column) => {
                const meta = column.columnDef.meta as CphColumnMeta | undefined;
                const widthClass = meta?.widthClass;
                return (
                  <col
                    key={column.id}
                    className={widthClass ? `cph-table__col-${widthClass}` : undefined}
                  />
                );
              })}
            </colgroup>
            {children}
          </table>
        </div>
      </div>
    </PinnedOffsetsContext.Provider>
  );
}