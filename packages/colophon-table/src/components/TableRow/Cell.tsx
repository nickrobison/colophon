/** @packageDocumentation Individual table cell. */

import type { CSSProperties, HTMLAttributes, ReactNode } from "react";

import { usePinnedOffset } from "../DataTable/pinnedOffsets";

export interface CellProps extends HTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  /** Is this cell pinned? */
  pinned?: "start" | "end" | undefined;
  /**
   * Column id used to look up the accumulated sticky offset from the
   * table's pinned-offsets context. Without it, pinned cells fall back to
   * the CSS `left: 0` and stacked pinned columns overlap.
   */
  columnId?: string | undefined;
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
  columnId,
  style,
  ...props
}: CellProps) {
  const isNumeric = numeric ?? align === "right";
  const offset = usePinnedOffset(columnId ?? "");
  const pinnedStyle =
    pinned !== undefined && columnId !== undefined && offset !== undefined
      ? pinned === "start"
        ? { left: `${offset.left}px` }
        : { left: "auto", right: `${offset.right ?? 0}px` }
      : undefined;
  const classes = [
    className,
    isNumeric && "cph-table__numeric",
    truncate && "cph-table__truncate",
    pinned && "cph-table__pinned",
  ]
    .filter(Boolean)
    .join(" ");
  const mergedStyle: CSSProperties | undefined =
    pinnedStyle !== undefined || style !== undefined ? { ...style, ...pinnedStyle } : undefined;

  return (
    <td
      {...props}
      className={classes}
      {...(mergedStyle !== undefined ? { style: mergedStyle } : {})}
      data-cph-table="cell"
      data-pinned={pinned}
      data-selected={selected ? "true" : undefined}
      data-col-index={colIndex?.toString()}
    >
      {children}
    </td>
  );
}
