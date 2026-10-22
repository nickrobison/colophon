/** @packageDocumentation Skeleton placeholder rows. */

import type { HTMLAttributes } from "react";

import { resolveCphTableDensity, useCphTableDensity } from "../theme/cphTableDensityContext";

export interface CphSkeletonProps extends HTMLAttributes<HTMLTableRowElement> {
  /** Number of rows to render. */
  rowCount: number;
  /** Number of visible columns for colSpan. */
  visibleColumnCount?: number;
  /** Density mode affecting row height. Defaults to the table density context. */
  density?: "comfortable" | "compact" | "dense";
}

export function CphSkeleton({
  rowCount,
  visibleColumnCount = 1,
  density,
  ...props
}: CphSkeletonProps) {
  const resolvedDensity = resolveCphTableDensity(density, useCphTableDensity());
  return (
    <>
      {/* oxlint-disable react/no-array-index-key -- placeholder rows have no stable identity before data loads */}
      {Array.from({ length: rowCount }).map((_, i) => (
        <tr
          key={`skeleton-row-${i}`}
          {...props}
          className={`cph-table__skeleton-row ${props.className ?? ""}`}
          data-cph-table="skeleton-row"
          data-density={resolvedDensity}
        >
          <td colSpan={visibleColumnCount} data-cph-table="skeleton-cell">
            <div className="cph-table__skeleton" data-cph-table="skeleton-bar" />
          </td>
        </tr>
      ))}
      {/* oxlint-enable react/no-array-index-key */}
    </>
  );
}
