/** @packageDocumentation The main table container component. */

import type { Table, RowData, ColumnPinningPosition } from "@tanstack/react-table";
import { useMemo, type ReactNode } from "react";

import type { CphColumnMeta } from "../../table/column";
import type { CphTableFeatures } from "../../table/features";
import { useCphTableDensity } from "../../theme/CphTableDensity";
import { CphTableSummary } from "../Summary/CphTableSummary";
import {
  computePinnedOffsets,
  PinnedOffsetsContext,
  type PinnedOffsetHeader,
} from "./pinnedOffsets";

export type { PinnedOffsetsContextValue } from "./pinnedOffsets";
export { usePinnedOffset } from "./pinnedOffsets";

export interface CphDataTableProps<
  TData extends RowData,
> extends React.HTMLAttributes<HTMLDivElement> {
  /** The TanStack table instance. */
  table: Table<CphTableFeatures, TData>;
  /** Header and row content (typically CphTableHead, CphTableBody, etc.). */
  children: ReactNode;
  /** Show summary footer when true. */
  showSummary?: boolean;
  /**
   * Accessible name for the table, applied as `aria-label` on the
   * `<table>` element (not the outer div, so it names the grid itself).
   * Omitted entirely when not provided.
   */
  tableLabel?: string;
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
  showSummary = false,
  tableLabel,
  className,
  ...props
}: CphDataTableProps<TData>) {
  const density = useCphTableDensity();
  // Collect all visible leaf columns in visual order: start, center, end
  const visibleLeafColumns = useMemo(
    () => [
      ...table.getStartVisibleLeafColumns(),
      ...table.getCenterVisibleLeafColumns(),
      ...table.getEndVisibleLeafColumns(),
    ],
    [table],
  );

  // Get pinned leaf headers for offset computation (start walks forward,
  // end walks in reverse inside computePinnedOffsets)
  const startLeafHeaders = useMemo(() => table.getStartLeafHeaders(), [table]);
  const endLeafHeaders = useMemo(() => table.getEndLeafHeaders(), [table]);

  // Map TanStack headers to our minimal interface for offset computation
  const offsetHeaders = useMemo(
    () =>
      [...startLeafHeaders, ...endLeafHeaders].map((header): PinnedOffsetHeader => ({
        id: header.id,
        getSize: () => header.getSize(),
        column: {
          getIsPinned: () => header.column.getIsPinned(),
          getIsLastColumn: (position?: ColumnPinningPosition | "center") =>
            header.column.getIsLastColumn(position),
        },
      })),
    [startLeafHeaders, endLeafHeaders],
  );

  // Compute pinned offsets and publish via context
  const pinnedOffsets = useMemo(() => computePinnedOffsets(offsetHeaders), [offsetHeaders]);

  const contextValue = useMemo(() => ({ offsets: pinnedOffsets }), [pinnedOffsets]);

  return (
    <PinnedOffsetsContext.Provider value={contextValue}>
      <div {...props} className={`cph-table-root ${className ?? ""}`} data-density={density}>
        <div className="cph-table-scroll">
          <table className="cph-table" {...(tableLabel ? { "aria-label": tableLabel } : {})}>
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
            {showSummary ? (
              <CphTableSummary
                table={table}
                showSummary
                totalCount={table.getCoreRowModel().rows.length}
              />
            ) : null}
          </table>
        </div>
      </div>
    </PinnedOffsetsContext.Provider>
  );
}
