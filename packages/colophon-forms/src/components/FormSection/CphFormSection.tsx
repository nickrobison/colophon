import type { ReactElement, ReactNode } from "react";

export interface CphFormSectionProps {
  /** Small-caps mono section label, e.g. "Inquiry record". */
  eyebrow: string;
  /** Section heading. Omit when `eyebrow` alone is enough. */
  title?: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function CphFormSection(props: CphFormSectionProps): ReactElement {
  const { eyebrow, title, description, children, className = "" } = props;
  return (
    <section className={`cph-form__section ${className}`}>
      <span className="cph-form__eyebrow">{eyebrow}</span>
      {title && <h3 className="cph-form__section-title">{title}</h3>}
      {description && <p className="cph-form__section-desc">{description}</p>}
      <div className="cph-form__section-body">{children}</div>
    </section>
  );
}
