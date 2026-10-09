/** @packageDocumentation Mobile stacked card layout for table rows. */

import type { HTMLAttributes, ReactNode } from "react";
import { Checkbox } from "react-aria-components";

import { composeClassName } from "../../utils/composeClassName";

export interface CphMobileCardProps {
  /** Unique identifier for the row. */
  id: string;
  /** Whether the row is selected. */
  isSelected?: boolean | undefined;
  /** Callback when selection changes. */
  onSelectionChange?: (id: string, selected: boolean) => void | undefined;
  /** Main content of the card. */
  children: ReactNode;
  /** Optional secondary content (e.g., metadata). */
  secondary?: ReactNode;
  /** Optional actions for the card. */
  actions?: ReactNode;
}

export function CphMobileCard({
  id,
  isSelected = false,
  onSelectionChange,
  children,
  secondary,
  actions,
}: CphMobileCardProps) {
  return (
    <article
      className="cph-table__mobile-card"
      data-selected={isSelected}
      data-cph-table="mobile-card"
      data-testid={`mobile-card-${id}`}
      role="listitem"
    >
      {(onSelectionChange !== undefined || actions) && (
        <div className="cph-table__mobile-card-header">
          {onSelectionChange !== undefined ? (
            <Checkbox
              isSelected={isSelected}
              onChange={(selected) => onSelectionChange(id, selected)}
              className="cph-table__mobile-select"
              aria-label={`Select row ${id}`}
            />
          ) : null}
          {actions && <div className="cph-table__mobile-card-actions">{actions}</div>}
        </div>
      )}
      <div className="cph-table__mobile-card-content">{children}</div>
      {secondary && <div className="cph-table__mobile-card-secondary">{secondary}</div>}
    </article>
  );
}

export interface CphMobileCardsProps extends HTMLAttributes<HTMLDivElement> {
  /** Array of row data to render as cards. */
  rows: Array<{
    id: string;
    isSelected?: boolean | undefined;
    content: ReactNode;
    secondary?: ReactNode;
    actions?: ReactNode;
  }>;
  /** Callback when row selection changes. */
  onSelectionChange?: (id: string, selected: boolean) => void;
  /** Render function for row content. */
  renderRow?: (row: {
    id: string;
    content: ReactNode;
    secondary?: ReactNode;
    actions?: ReactNode;
  }) => ReactNode;
}

export function CphMobileCards({
  rows,
  onSelectionChange,
  renderRow,
  className,
  children,
  ...props
}: CphMobileCardsProps) {
  // For native elements, composeClassName may return a function (render-props callback).
  // We need to resolve it to a string for native DOM elements.
  const rootClassName = (() => {
    const composed = composeClassName("cph-table__mobile-cards", className);
    return typeof composed === "function" ? composed({ defaultClassName: undefined }) : composed;
  })();

  return (
    <div
      {...props}
      className={rootClassName}
      data-cph-table="mobile-cards"
      data-testid="mobile-cards"
      role="list"
      aria-label="Table rows as cards"
    >
      {rows.map((row) => (
        <CphMobileCard
          key={row.id}
          id={row.id}
          isSelected={row.isSelected}
          {...(onSelectionChange ? { onSelectionChange } : {})}
          secondary={row.secondary}
          actions={row.actions}
        >
          {renderRow ? renderRow(row) : row.content}
        </CphMobileCard>
      ))}
      {children}
    </div>
  );
}
