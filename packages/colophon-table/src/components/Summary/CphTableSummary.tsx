/** @packageDocumentation Table summary/aggregate footer row. */

import type { CphColumnMeta } from "../../table/column";
import { getAggregationValue } from "../../table/summary";

/** Minimal table interface for summary footer - avoids complex TanStack Table v9 generics. */
export interface CphTableSummaryTable {
  getLeafColumns: () => Array<{
    id: string;
    getIsVisible: () => boolean;
    getIsPinned: () => "start" | "end" | false;
    getMeta: () => CphColumnMeta | undefined;
    getAggregationValue: (options: { rows: unknown[] }) => unknown;
  }>;
  getFilteredRowModel: () => { rows: unknown[] };
}

export interface CphTableSummaryProps {
  /** The TanStack Table instance (minimal interface). */
  table: CphTableSummaryTable;
  /** Opt-in: show the summary footer. When false, no tfoot is rendered. */
  showSummary?: boolean;
  /** Total row count (unfiltered) for "of N total" note. */
  totalCount?: number;
}

/**
 * Sticky footer showing aggregated values for filtered rows.
 *
 * Renders as `<tfoot class="cph-table__summary">` when `showSummary` is true.
 * When false or absent, no `<tfoot>` element exists in the DOM.
 *
 * Each visible leaf column with `meta.aggregate` ("sum" | "mean" | "count")
 * displays its filter-aware aggregate. Columns without an aggregate render empty.
 * An "of N total" note shows the filtered row count against the total.
 */
export function CphTableSummary({
  table,
  showSummary = false,
  totalCount,
}: CphTableSummaryProps) {
  if (!showSummary) {
    return null;
  }

  const filteredRows = table.getFilteredRowModel().rows;
  const filteredCount = filteredRows.length;
  const leafColumns = table.getLeafColumns().filter((col) => col.getIsVisible());

  return (
    <tfoot className="cph-table__summary" data-cph-table="summary" aria-label="Summary" role="rowgroup">
      <tr>
        {leafColumns.map((column, index) => {
          const meta = column.getMeta();
          const aggregate = meta?.aggregate;
          const isPinned = column.getIsPinned() === "start" || column.getIsPinned() === "end";
          const isNumeric = meta?.numeric === true;
          const isFirstColumn = index === 0;

          let cellContent: React.ReactNode = null;

          if (aggregate) {
            // Use the column's getAggregationValue with filtered rows for filter-aware aggregation
            const aggregatedValue = column.getAggregationValue({
              rows: filteredRows,
            });

            // Format the value if a formatter is provided
            const formattedValue = meta?.format
              ? meta.format(aggregatedValue)
              : String(aggregatedValue ?? "");

            cellContent = formattedValue;
          }

          // First column renders as <th scope="row"> for the label/note
          if (isFirstColumn) {
            return (
              <th
                key={column.id}
                scope="row"
                className={`cph-table__summary-cell ${isPinned ? "cph-table__pinned" : ""}`}
                data-cph-table="summary-cell"
                data-pinned={isPinned ? "true" : undefined}
              >
                <span data-cph-table="summary-label">Summary</span>
                {totalCount !== undefined && filteredCount !== totalCount && (
                  <small data-cph-table="total-note">
                    of {totalCount} total
                  </small>
                )}
              </th>
            );
          }

          // Data columns render as <td>
          return (
            <td
              key={column.id}
              className={`cph-table__summary-cell ${isNumeric ? "cph-table__numeric" : ""} ${isPinned ? "cph-table__pinned" : ""}`}
              data-cph-table="summary-cell"
              data-pinned={isPinned ? "true" : undefined}
              data-numeric={isNumeric ? "true" : undefined}
            >
              {cellContent}
            </td>
          );
        })}
      </tr>
    </tfoot>
  );
}