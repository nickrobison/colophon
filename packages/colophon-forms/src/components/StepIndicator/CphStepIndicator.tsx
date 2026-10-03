import { Check } from "lucide-react";
import type { ReactElement } from "react";

export interface CphStep {
  label: string;
}

export interface CphStepIndicatorProps {
  /** Ordered step labels. Length defines the total step count. */
  steps: readonly CphStep[];
  /** Zero-based index of the current step. */
  current: number;
  className?: string;
}

export function CphStepIndicator(props: CphStepIndicatorProps): ReactElement {
  const { steps, current, className = "" } = props;
  return (
    <nav aria-label="Form progress" className={`cph-steps ${className}`}>
      <ol className="cph-steps__list">
        {steps.map((step, index) => {
          const isComplete = index < current;
          const isCurrent = index === current;
          const state = isComplete
            ? " cph-steps__item--complete"
            : isCurrent
              ? " cph-steps__item--current"
              : "";
          return (
            <li
              key={step.label}
              aria-current={isCurrent ? "step" : undefined}
              className={`cph-steps__item${state}`}
            >
              <span className="cph-steps__marker" aria-hidden="true">
                {isComplete ? <Check size={12} /> : index + 1}
              </span>
              <span className="cph-steps__label">{step.label}</span>
            </li>
          );
        })}
      </ol>
      <p className="cph-steps__count">
        Step {current + 1} of {steps.length}
      </p>
    </nav>
  );
}
