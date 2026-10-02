import type { ReactElement } from "react";
import { TriangleAlert } from "lucide-react";

export interface CphErrorSummaryEntry {
  /** DOM id of the field wrapper to jump to, e.g. "title-field". */
  fieldId: string;
  message: string;
}

export interface CphErrorSummaryProps {
  errors: readonly CphErrorSummaryEntry[];
  className?: string;
}

export function CphErrorSummary(props: CphErrorSummaryProps): ReactElement | null {
  const { errors, className = "" } = props;
  if (errors.length === 0) return null;

  return (
    <section
      aria-labelledby="cph-error-summary-title"
      className={`cph-error-summary ${className}`}
      role="alert"
    >
      <TriangleAlert size={20} aria-hidden="true" />
      <div>
        <h3 id="cph-error-summary-title" tabIndex={-1}>
          {errors.length === 1
            ? "1 field needs attention"
            : `${errors.length} fields need attention`}
        </h3>
        <ul className="cph-error-summary__list">
          {errors.map((entry) => (
            <li key={entry.fieldId}>
              <a href={`#${entry.fieldId}`}>{entry.message}</a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
