import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "react-aria-components";

/** Mirrors `CphBadgeTone` so alert tone and badge tone stay in lockstep. */
export type CphAlertTone = "neutral" | "sage" | "orange" | "error";

export type CphAlertVariant = "inline" | "banner";

const TONE_LABEL: Record<CphAlertTone, string> = {
  neutral: "Neutral alert",
  sage: "Success alert",
  orange: "Warning alert",
  error: "Error alert",
};

export interface CphAlertProps {
  /** Defaults to `"neutral"`. */
  tone?: CphAlertTone | undefined;
  /** Main content. */
  message?: ReactNode | undefined;
  /** Optional bold label rendered above the message. */
  header?: ReactNode | undefined;
  /** Optional start icon (decorative; callers typically pass a `lucide-react` icon). */
  icon?: ReactNode | undefined;
  /** Render a dismiss button. */
  dismiss?: boolean | undefined;
  /** Called when the dismiss button is pressed. */
  onDismiss?: (() => void) | undefined;
  /** `inline` (default) fills width; `banner` is a top-level strip. */
  variant?: CphAlertVariant | undefined;
  className?: string | undefined;
}

/**
 * An inline banner / status message.
 *
 * Tone drives both colour and semantics: `error` announces assertively via
 * `role="alert"`, every other tone is a polite `role="status"`. The dismiss
 * control is a React Aria `Button`, so keyboard and pointer interaction stay
 * consistent with the rest of the system.
 */
export function CphAlert({
  tone = "neutral",
  message,
  header,
  icon,
  dismiss,
  onDismiss,
  variant = "inline",
  className = "",
}: CphAlertProps) {
  const isError = tone === "error";
  return (
    <div
      className={`cph-alert cph-alert--${tone} cph-alert--${variant} ${className}`}
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      {...(header ? {} : { "aria-label": TONE_LABEL[tone] })}
    >
      {icon && (
        <span className="cph-alert__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <div className="cph-alert__content">
        {header && <strong className="cph-alert__header">{header}</strong>}
        {message && <span className="cph-alert__message">{message}</span>}
      </div>
      {dismiss && (
        <Button
          aria-label="Dismiss alert"
          className="cph-alert__dismiss"
          {...(onDismiss ? { onPress: onDismiss } : {})}
        >
          <X size={14} aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
