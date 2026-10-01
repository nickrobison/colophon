import type { ReactNode } from "react";
export function CphFieldNote({ index = "Nº 04", quote, caption }: { index?: string; quote: ReactNode; caption?: string }) {
  return (
    <div className="cph-field-note">
      <span className="cph-field-note__index">{index}</span>
      <p>{quote}</p>
      <span className="cph-field-note__rule" aria-hidden="true" />
      {caption && <small>{caption}</small>}
    </div>
  );
}
