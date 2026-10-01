import { CphBadge } from "../Badge/Badge";
export interface CphSignal { label: string; value: string; delta: string; mark: string; urgent?: boolean | undefined }
export function CphSignalTile({ label, value, delta, mark, urgent = false }: CphSignal) {
  return (
    <article className="cph-signal">
      <div className="cph-signal__top"><span aria-hidden="true" className="cph-signal__mark">{mark}</span><CphBadge tone={urgent ? "orange" : "sage"}>{delta}</CphBadge></div>
      <strong>{value}</strong><span>{label}</span>
    </article>
  );
}
