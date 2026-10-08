/** @packageDocumentation Empty table state. */

import type { HTMLAttributes, ReactNode } from "react";

export interface CphTableEmptyProps extends HTMLAttributes<HTMLTableSectionElement> {
  /** Message to display. */
  message: ReactNode;
  /** Optional action button. Single action only — no SVG icons. */
  action?: ReactNode;
  /** Number of visible columns for colSpan. */
  visibleColumnCount?: number;
}

/**
 * Empty state for tables with no data.
 *
 * Single-action design without SVG icon.
 * Uses serif font and centred layout via cph-table__empty class.
 */
export function CphTableEmpty({
  message,
  action,
  visibleColumnCount = 1,
  ...props
}: CphTableEmptyProps) {
  return (
    <tbody {...props} data-cph-table="empty-state">
      <tr>
        <td colSpan={visibleColumnCount} data-cph-table="empty-cell" className="cph-table__empty">
          <div data-cph-table="empty-message" className="cph-table__empty">
            {message}
          </div>
          {action && (
            <div data-cph-table="empty-action" className="cph-table__empty-action">
              {action}
            </div>
          )}
        </td>
      </tr>
    </tbody>
  );
}
