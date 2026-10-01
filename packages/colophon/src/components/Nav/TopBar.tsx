import type { ReactNode } from "react";

export interface CphTopBarProps {
  leading?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
}

/**
 * Sticky command-bar header. Slots keep the search submit control quiet —
 * it must never be the loudest element (spec §10).
 */
export function CphTopBar({ leading, children, actions }: CphTopBarProps) {
  return (
    <header className="cph-topbar">
      {leading}
      {children}
      {actions ? <div className="cph-topbar__actions">{actions}</div> : null}
    </header>
  );
}
