import { type ReactNode } from "react";
export interface PanelProps { heading: ReactNode; footer?: ReactNode; children: ReactNode; className?: string }
export function CphPanel({ heading, footer, children, className = "" }: PanelProps) {
  return (
    <section className={`cph-panel ${className}`}>
      <div className="cph-panel__heading">{heading}</div>
      <div className="cph-panel__body">{children}</div>
      {footer && <footer className="cph-panel__footer">{footer}</footer>}
    </section>
  );
}
