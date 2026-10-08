/** @packageDocumentation Page size constants and utilities. */

/** Supported page sizes in ascending order. */
export const PAGE_SIZES = [8, 12, 20] as const;

export type PageSize = (typeof PAGE_SIZES)[number];

/** Human-readable labels for the supported page sizes. */
export const PAGE_SIZE_LABELS: Record<PageSize, string> = {
  8: "8 per page",
  12: "12 per page",
  20: "20 per page",
};

/** Default page size. */
export const DEFAULT_PAGE_SIZE: PageSize = 8;

/** Returns at least one page, including when there are no rows. */
export function getTotalPages(rowCount: number, pageSize: PageSize): number {
  return Math.max(1, Math.ceil(rowCount / pageSize));
}

/** Get the next page size in the cycle. */
export function nextPageSize(current: PageSize): PageSize {
  const idx = PAGE_SIZES.indexOf(current);
  const next = PAGE_SIZES[(idx + 1) % PAGE_SIZES.length];
  if (next === undefined) {
    throw new Error("Invalid page size cycle");
  }
  return next;
}
