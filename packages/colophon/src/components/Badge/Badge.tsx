import type { ReactNode } from "react";

export type CphBadgeTone = "neutral" | "orange" | "sage" | "error";
export interface CphBadgeProps { children: ReactNode; tone?: CphBadgeTone; className?: string }
export function CphBadge({ children, tone = "neutral", className = "" }: CphBadgeProps) {
  return <span className={`cph-badge cph-badge--${tone} ${className}`}>{children}</span>;
}
