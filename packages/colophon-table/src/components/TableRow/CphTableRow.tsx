/** @packageDocumentation Table row component. */

import type { HTMLAttributes, ReactNode } from "react";

export interface CphTableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  /** Row state: selected, hovered, etc. */
  state?: "selected" | "hovered" | undefined;
}

export function CphTableRow({
  children,
  state,
  ...props
}: CphTableRowProps) {
  return (
    <tr
      {...props}
      data-cph-table="row"
      data-state={state ?? undefined}
    >
      {children}
    </tr>
  );
}
