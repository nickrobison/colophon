/** @packageDocumentation Pure pinned-column offset computation. */

import type { ColumnPinningPosition } from "@tanstack/react-table";
import { createContext, useContext } from "react";

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
  /** Accumulated left offset in pixels (start-pinned columns). */
  left: number;
  /** Whether this is the last pinned column in the start region. */
  isLast: boolean;
  /**
   * Accumulated right offset in pixels (end-pinned columns only).
   * Absent for start-pinned entries so existing structural assertions hold.
   */
  right?: number | undefined;
}

/**
 * Computes sticky offsets for pinned leaf headers.
 *
 * Walks visible leaf headers in order, accumulating `header.getSize()` for
 * start-pinned columns into `left`, then walks in reverse accumulating `right`
 * for end-pinned columns. `isLast` comes from `column.getIsLastColumn("start")`
 * (or `"end"` for end-pinned entries).
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

  let runningRight = 0;
  for (let index = headers.length - 1; index >= 0; index -= 1) {
    const header = headers[index];
    if (header === undefined || header.column.getIsPinned() !== "end") {
      continue;
    }

    const isLast = header.column.getIsLastColumn("end");
    offsets.set(header.id, { left: 0, isLast, right: runningRight });
    runningRight += header.getSize();
  }

  return offsets;
}

/** Context value for pinned column offsets. */
export interface PinnedOffsetsContextValue {
  offsets: ReadonlyMap<string, PinnedOffsetEntry>;
}

export const PinnedOffsetsContext = createContext<PinnedOffsetsContextValue | null>(null);

/**
 * Consumes the pinned-offsets context published by {@link CphDataTable}.
 * Returns the offset entry for the given header id, or undefined if not pinned.
 */
export function usePinnedOffset(headerId: string): PinnedOffsetEntry | undefined {
  const ctx = useContext(PinnedOffsetsContext);
  return ctx?.offsets.get(headerId);
}
