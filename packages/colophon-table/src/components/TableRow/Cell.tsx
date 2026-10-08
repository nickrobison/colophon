/** @packageDocumentation Individual table cell. */

import type { HTMLAttributes, ReactNode } from "react";

export interface CellProps extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  /** Is this cell pinned? */
  pinned?: "start" | "end" | undefined;
  /** Is this cell selected? */
  selected?: boolean;
  /** Column index for colgroup reference. */
  colIndex?: number;
  /** Apply numeric styling (tabular-nums, right-align). */
  numeric?: boolean | undefined;
  /** Apply truncation styling (ellipsis overflow). */
  truncate?: boolean | undefined;
  /** Text alignment; "right" implies numeric styling. */
  align?: "left" | "right" | undefined;
}

export function Cell({
  children,
  pinned,
  selected,
  colIndex,
  numeric,
  truncate,
  align,
  className,
  ...props
}: CellProps) {
  const isNumeric = numeric ?? align === "right";
  const classes = [
    className,
    isNumeric && "cph-table__numeric",
    truncate && "cph-table__truncate",
    pinned && "cph-table__pinned",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <td
      {...props}
      className={classes}
      data-cph-table="cell"
      data-pinned={pinned}
      data-selected={selected ? "true" : undefined}
      data-col-index={colIndex?.toString()}
    >
      {children}
    </td>
  );
}
