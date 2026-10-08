/** @packageDocumentation Table pagination controls. */

import type { HTMLAttributes, Key } from "react";
import { Button, ListBox, ListBoxItem, Select, SelectValue } from "react-aria-components";

import { PAGE_SIZES, type PageSize } from "../../table/pageSize";
import { composeClassName } from "../../utils/composeClassName";

export interface CphPaginationProps extends HTMLAttributes<HTMLDivElement> {
  /** Current page number (1-based). */
  currentPage: number;
  /** Total number of pages. */
  totalPages: number;
  /** Callback when page changes. */
  onPageChange: (page: number) => void;
  /** Current page size. */
  pageSize: PageSize;
  /** Callback when page size changes. */
  onPageSizeChange: (size: PageSize) => void;
}

function isPageSize(value: number): value is PageSize {
  return PAGE_SIZES.some((size) => size === value);
}

export function CphPagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  className,
  ...props
}: CphPaginationProps) {
  const handlePageSizeChange = (value: Key | null) => {
    if (typeof value !== "string") {
      return;
    }

    const numericValue = Number(value);
    if (isPageSize(numericValue)) {
      onPageSizeChange(numericValue);
    }
  };

  // For native elements, composeClassName may return a function (render-props callback).
  // We need to resolve it to a string for native DOM elements.
  const rootClassName = (() => {
    const composed = composeClassName("cph-table__pagination", className);
    return typeof composed === "function" ? composed({ defaultClassName: undefined }) : composed;
  })();

  return (
    <div {...props} className={rootClassName} data-cph-table="pagination" data-testid="pagination">
      <nav aria-label="Pagination">
        <div style={{ display: "flex", alignItems: "center", gap: "var(--cph-space-4)" }}>
          <Button
            onPress={() => onPageChange(Math.max(1, currentPage - 1))}
            isDisabled={currentPage <= 1}
            className="cph-table__pagination-btn"
            aria-label="Previous page"
          >
            Previous
          </Button>
          <span className="cph-table__pagination-page" aria-live="polite">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onPress={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            isDisabled={currentPage >= totalPages}
            className="cph-table__pagination-btn"
            aria-label="Next page"
          >
            Next
          </Button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--cph-space-2)" }}>
          <span className="cph-table__pagination-label">Rows per page:</span>
          <Select
            selectedKey={String(pageSize)}
            onSelectionChange={handlePageSizeChange}
            className={composeClassName("cph-table__pagination-select", undefined)}
            aria-label="Rows per page"
          >
            <Button className="cph-table__pagination-select-btn" slot="label">
              <SelectValue>
                {({ selectedText, defaultChildren }) => selectedText ?? defaultChildren}
              </SelectValue>
            </Button>
            <ListBox>
              {PAGE_SIZES.map((size) => (
                <ListBoxItem key={size} id={String(size)} textValue={String(size)}>
                  {size}
                </ListBoxItem>
              ))}
            </ListBox>
          </Select>
        </div>
      </nav>
    </div>
  );
}
