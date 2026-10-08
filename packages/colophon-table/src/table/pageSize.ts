/** @packageDocumentation Page size constants and utilities. */

/** Supported page sizes in ascending order. */
export const PAGE_SIZES = [8, 12, 20] as const;

export type PageSize = (typeof PAGE_SIZES)[number];

/** Default page size. */
export const DEFAULT_PAGE_SIZE: PageSize = 8;

/** Get the next page size in the cycle. */
export function nextPageSize(current: PageSize): PageSize {
  const idx = PAGE_SIZES.indexOf(current);
  const next = PAGE_SIZES[(idx + 1) % PAGE_SIZES.length];
  if (next === undefined) {
    throw new Error("Invalid page size cycle");
  }
  return next;
}
