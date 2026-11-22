/** @packageDocumentation Cursor-based pagination controls for tables. */

import type { HTMLAttributes } from "react";
import { Button } from "react-aria-components";

import { composeClassName } from "../../utils/composeClassName";

export interface CphCursorPaginationProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether a next page exists. */
  hasNextPage?: boolean | undefined;
  /** Whether a previous page exists. */
  hasPreviousPage?: boolean | undefined;
  /** Cursor marking the start of the next page. */
  startCursor?: string | null | undefined;
  /** Cursor marking the end of the next page. */
  endCursor?: string | null | undefined;
  /** Called with the next page's start cursor. */
  onNextPage?: ((cursor?: string | null) => void) | undefined;
  /** Called with the previous page's end cursor. */
  onPreviousPage?: ((cursor?: string | null) => void) | undefined;
  /** True while a page fetch is in flight; disables navigation. */
  isLoading?: boolean | undefined;
}

/**
 * Cursor-based pagination controls.
 *
 * Renders a `nav` landmark (labelled) with Previous/Next buttons. Callbacks
 * receive the cursor that should be requested next.
 */
export function CphCursorPagination({
  hasNextPage,
  hasPreviousPage,
  startCursor,
  endCursor,
  onNextPage,
  onPreviousPage,
  isLoading,
  className,
  ...props
}: CphCursorPaginationProps) {
  const rootClassName = (() => {
    const composed = composeClassName("cph-table__pagination", className);
    return typeof composed === "function" ? composed({ defaultClassName: undefined }) : composed;
  })();

  return (
    <div
      {...props}
      className={rootClassName}
      data-cph-table="cursor-pagination"
      data-testid="cursor-pagination"
    >
      <nav aria-label="Table pagination">
        <Button
          className="cph-btn cph-btn--secondary cph-table__pagination-btn"
          isDisabled={!hasNextPage || Boolean(isLoading)}
          onPress={() => onNextPage?.(endCursor ?? null)}
          aria-label="Next"
        >
          Next
        </Button>
        <Button
          className="cph-btn cph-btn--secondary cph-table__pagination-btn"
          isDisabled={!hasPreviousPage || Boolean(isLoading)}
          onPress={() => onPreviousPage?.(startCursor ?? null)}
          aria-label="Previous"
        >
          Previous
        </Button>
      </nav>
    </div>
  );
}
