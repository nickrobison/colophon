/** @packageDocumentation Table summary/aggregate footer row. */

import type { Column, Row, RowData, Table } from "@tanstack/react-table";

import type { CphTableFeatures } from "../../table/features";
import { usePinnedOffset } from "../DataTable/pinnedOffsets";

export interface CphTableSummaryProps<TData extends RowData> {
  /** The TanStack Table instance. */
  table: Table<CphTableFeatures, TData>;
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
export function CphTableSummary<TData extends RowData>({
  table,
  showSummary = false,
  totalCount,
}: CphTableSummaryProps<TData>) {
  if (!showSummary) {
    return null;
  }

  const filteredRows = table.getFilteredRowModel().rows;
  const filteredCount = filteredRows.length;
  const leafColumns = table.getAllLeafColumns().filter((col) => col.getIsVisible());

  return (
    <tfoot className="cph-table__summary" data-cph-table="summary" aria-label="Summary">
      <tr>
        {leafColumns.map((column, index) => (
          <SummaryCell
            key={column.id}
            column={column}
            isFirstColumn={index === 0}
            filteredRows={filteredRows}
            filteredCount={filteredCount}
            totalCount={totalCount}
          />
        ))}
      </tr>
    </tfoot>
  );
}

function SummaryCell<TData extends RowData>({
  column,
  isFirstColumn,
  filteredRows,
  filteredCount,
  totalCount,
}: {
  column: Column<CphTableFeatures, TData, unknown>;
  isFirstColumn: boolean;
  filteredRows: Row<CphTableFeatures, TData>[];
  filteredCount: number;
  totalCount?: number | undefined;
}) {
  const offset = usePinnedOffset(column.id);
  const meta = column.columnDef.meta;
  const aggregate = meta?.aggregate;
  const pinned = column.getIsPinned();
  const isPinned = pinned === "start" || pinned === "end";
  const isNumeric = meta?.numeric === true;
  const pinnedStyle =
    !isPinned || offset === undefined
      ? undefined
      : pinned === "start"
        ? { left: `${offset.left}px` }
        : { left: "auto", right: `${offset.right ?? 0}px` };

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
        scope="row"
        className={`cph-table__summary-cell ${isPinned ? "cph-table__pinned" : ""}`}
        style={pinnedStyle}
        data-cph-table="summary-cell"
        data-pinned={isPinned ? "true" : undefined}
      >
        <span data-cph-table="summary-label">Summary</span>
        {totalCount !== undefined && filteredCount !== totalCount && (
          <small data-cph-table="total-note">of {totalCount} total</small>
        )}
      </th>
    );
  }

  // Data columns render as <td>
  return (
    <td
      className={`cph-table__summary-cell ${isNumeric ? "cph-table__numeric" : ""} ${isPinned ? "cph-table__pinned" : ""}`}
      style={pinnedStyle}
      data-cph-table="summary-cell"
      data-pinned={isPinned ? "true" : undefined}
      data-numeric={isNumeric ? "true" : undefined}
    >
      {cellContent}
    </td>
  );
}
