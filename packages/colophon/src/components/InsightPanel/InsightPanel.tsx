import { useState, type ReactNode } from "react";
import { Button } from "react-aria-components";
export function CphInsightPanel({
  eyebrow = "FIELD NOTE · 017",
  title,
  children,
  actionLabel = "Examine connections",
  brief,
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  actionLabel?: string;
  brief?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <aside className="cph-insight">
      <div className="cph-insight__folio">{eyebrow}</div>
      <h2>{title}</h2>
      <div>{children}</div>
      <Button className="cph-btn cph-btn--secondary" onPress={() => setOpen((v) => !v)}>
        {open ? "Close evidence brief" : actionLabel}
      </Button>
      {open && brief && (
        <div className="cph-insight__disclosure">
          <strong>Evidence brief</strong>
          <p>{brief}</p>
        </div>
      )}
    </aside>
  );
}
