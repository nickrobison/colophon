import type { ReactElement } from "react";
import { Check } from "lucide-react";

export type CphSaveState = "idle" | "saving" | "saved" | "error";

export interface CphSaveIndicatorProps {
  state: CphSaveState;
  /** Optional message for the error state, e.g. "Couldn't save — retry". */
  errorMessage?: string;
  className?: string;
}

export function CphSaveIndicator(props: CphSaveIndicatorProps): ReactElement {
  const { state, errorMessage, className = "" } = props;
  return (
    <span
      aria-live="polite"
      className={`cph-save-indicator cph-save-indicator--${state} ${className}`}
    >
      {state === "saving" && "Saving…"}
      {state === "saved" && (
        <>
          <Check size={12} aria-hidden="true" /> Saved
        </>
      )}
      {state === "error" && (errorMessage ?? "Couldn't save — retry")}
    </span>
  );
}
