import { useState, type ReactNode } from "react";
import { Button } from "react-aria-components";
import { CphBadge } from "../Badge/Badge";
export interface CphCardProps { id: string; title: string; owner: string; sources: number; stageLabel: string; note: string; concepts: string[]; featured?: boolean; defaultExpanded?: boolean }
export function CphCard({ id, title, owner, sources, stageLabel, note, concepts, featured = false, defaultExpanded = false }: CphCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <article className={`cph-card ${featured ? "cph-card--featured" : ""}`}>
      <div className="cph-card__folio"><span>{id}</span><CphBadge tone={stageLabel === "Complete" ? "sage" : stageLabel === "Synthesis" ? "orange" : "neutral"}>{stageLabel}</CphBadge></div>
      <div className="cph-card__heading"><h3>{title}</h3><p>{owner} · {sources} sources</p></div>
      <div className="cph-card__concepts">{concepts.map(c => <CphBadge key={c}>{c}</CphBadge>)}</div>
      <div className="cph-card__footer">
        <Button aria-expanded={expanded} aria-label={expanded ? "Close note" : "Read note"} className="cph-btn cph-btn--text" onPress={() => setExpanded(v => !v)}>{expanded ? "Close note" : "Read note"}</Button>
      </div>
      {expanded && <div className="cph-card__note"><span className="cph-eyebrow">Research note</span><p>{note}</p></div>}
    </article>
  );
}
export type { ReactNode };
