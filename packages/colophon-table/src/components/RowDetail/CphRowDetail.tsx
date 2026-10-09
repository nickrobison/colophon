/** @packageDocumentation Expandable row detail content. */

import type { HTMLAttributes, ReactNode } from "react";

export interface CphRowDetailProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  /** Number of visible cells to determine colspan. */
  visibleCellsCount: number;
  /** Whether row is expanded. */
  expanded: boolean;
}

/**
 * Detail row that expands when parent row is expanded.
 *
 * Uses a 200ms grid-rows animation for smooth expansion.
 * ColSpan covers all visible cells.
 * Detail content renders in the serif face (--cph-font-serif).
 * The expanded state is exposed via aria-expanded for accessibility.
 */
export function CphRowDetail({
  children,
  visibleCellsCount,
  expanded,
  ...props
}: CphRowDetailProps) {
  return (
    <tr
      {...props}
      data-cph-table="detail-row"
      data-expanded={expanded ? "true" : "false"}
      aria-expanded={expanded}
    >
      <td
        colSpan={visibleCellsCount}
        data-cph-table="detail-cell"
        style={expanded ? { padding: 0 } : { padding: 0, height: 0 }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateRows: expanded ? "1fr" : "0fr",
            transition: "grid-template-rows 0.2s var(--cph-ease-out)",
            overflow: "hidden",
            minHeight: 0,
          }}
          data-cph-table="detail-animation"
        >
          <div
            style={{
              minHeight: 0,
              overflow: "hidden",
              fontFamily: "var(--cph-font-serif)",
              padding: "var(--cph-table-cell-y) var(--cph-space-3)",
            }}
            data-cph-table="detail-content"
            aria-hidden={!expanded}
            inert={!expanded}
          >
            {children}
          </div>
        </div>
      </td>
    </tr>
  );
}
