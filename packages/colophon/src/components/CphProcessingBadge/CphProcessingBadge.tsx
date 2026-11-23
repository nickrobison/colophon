import { Loader, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "react-aria-components";

export type CphProcessingStatus = "pending" | "available" | "failed";

export interface CphProcessingBadgeProps {
  /** Current document processing status. */
  status: CphProcessingStatus;
  /** Document identifier or short label rendered inside the chip. */
  label?: ReactNode | undefined;
  /** Error detail rendered in the failed state; falls back to `label`. */
  message?: ReactNode | undefined;
  /** Retry handler; renders a retry control only while the status is `failed`. */
  onRetry?: (() => void) | undefined;
  className?: string | undefined;
}

/**
 * A compact status chip for document processing states.
 *
 * - `pending` renders a spinner plus label.
 * - `available` renders a neutral chip.
 * - `failed` renders an alert-toned chip; pass `onRetry` to surface a retry
 *   control that fires the processing retry for the failed document.
 */
export function CphProcessingBadge({
  status,
  label,
  message,
  onRetry,
  className = "",
}: CphProcessingBadgeProps) {
  const isFailed = status === "failed";
  const content = isFailed ? (message ?? label) : label;
  return (
    <span
      className={`cph-processing-badge cph-processing-badge--${status} ${className}`.trim()}
      role={isFailed ? "alert" : "status"}
      aria-live={isFailed ? "assertive" : "polite"}
    >
      {status === "pending" && (
        <span className="cph-processing-badge__spinner" aria-hidden="true">
          <Loader size={12} className="cph-spin" />
        </span>
      )}
      <span className="cph-processing-badge__label">{content}</span>
      {isFailed && onRetry ? (
        <Button className="cph-processing-badge__retry" onPress={onRetry}>
          <RefreshCw size={10} aria-hidden="true" />
          Retry
        </Button>
      ) : null}
    </span>
  );
}
