import { CphBadge, type CphBadgeTone } from "@nickrobison/colophon";
import type { ReactElement, ReactNode } from "react";

/** Mirrors `CphBadgeTone`; kept as an alias so callers need not import core directly. */
export type CphStatusTone = CphBadgeTone;

export interface CphStatusChipProps {
  children: ReactNode;
  /** Defaults to `"neutral"`. */
  tone?: CphStatusTone | undefined;
  className?: string | undefined;
}

/**
 * A status value rendered as a small inline chip.
 *
 * The coloured dot is `aria-hidden`, so the status is carried entirely by the label
 * text. That is deliberate: the Tables Spec forbids conveying status by colour alone,
 * and red/green are indistinguishable to many colour-blind users. Any tone change here
 * must keep the text present.
 */
export function CphStatusChip({
  children,
  tone = "neutral",
  className = "",
}: CphStatusChipProps): ReactElement {
  return (
    <CphBadge tone={tone} className={`cph-table__chip ${className}`}>
      <span aria-hidden="true" className="cph-table__chip-dot" />
      {children}
    </CphBadge>
  );
}
