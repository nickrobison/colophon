/** @packageDocumentation Pure pinned-column offset computation. */

import type { ColumnPinningPosition } from "@tanstack/react-table";

/**
 * Minimal structural interface for a leaf header used by offset computation.
 * Keeps the function testable with plain objects — no TanStack table instance needed.
 */
export interface PinnedOffsetHeader {
  /** The header's unique identifier. */
  id: string;
  /** The associated column instance. */
  column: {
    /** Returns the logical pinned position: 'start', 'end', or false. */
    getIsPinned: () => ColumnPinningPosition;
    /** Returns true if this is the last visible column in the given region. */
    getIsLastColumn: (position?: ColumnPinningPosition | "center") => boolean;
  };
  /** Returns the header's rendered size from its leaf columns. */
  getSize: () => number;
}

/**
 * Result entry for a pinned column.
 */
export interface PinnedOffsetEntry {
  /** Accumulated left offset in pixels. */
  left: number;
  /** Whether this is the last pinned column in the start region. */
  isLast: boolean;
}

/**
 * Computes sticky left offsets for start-pinned leaf headers.
 *
 * Walks visible leaf headers in order, skips anything whose
 * `column.getIsPinned() !== "start"`, and accumulates `header.getSize()`
 * so each pinned column's `left` is the running total of pinned widths before it.
 * `isLast` comes from `column.getIsLastColumn("start")`.
 * Unpinned columns are absent from the returned map.
 */
export function computePinnedOffsets(
  headers: ReadonlyArray<PinnedOffsetHeader>,
): ReadonlyMap<string, PinnedOffsetEntry> {
  const offsets = new Map<string, PinnedOffsetEntry>();
  let runningLeft = 0;

  for (const header of headers) {
    const isPinned = header.column.getIsPinned();
    if (isPinned !== "start") {
      continue;
    }

    const isLast = header.column.getIsLastColumn("start");
    offsets.set(header.id, { left: runningLeft, isLast });
    runningLeft += header.getSize();
  }

  return offsets;
}
