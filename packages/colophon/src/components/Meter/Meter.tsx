import type { ReactNode } from "react";
import { Meter } from "react-aria-components";

export type CphMeterTone = "positive" | "negative" | "neutral";

export interface CphMeterProps {
  value: number;
  max?: number;
  tone?: CphMeterTone;
  label?: ReactNode;
  suffix?: string;
  compact?: boolean;
  ariaLabel?: string;
  className?: string;
}

export function CphMeter({
  value,
  max = 20,
  tone,
  label,
  suffix,
  compact = false,
  ariaLabel,
  className,
}: CphMeterProps) {
  const abs = Math.abs(value);
  const signedText = `${value > 0 ? "+" : ""}${value}${suffix ? ` ${suffix}` : ""}`;
  const resolvedTone = tone ?? (value < 0 ? "negative" : value > 0 ? "positive" : "neutral");
  const resolvedAriaLabel = ariaLabel ?? (typeof label === "string" ? label : signedText);
  const meterClassName = [
    "cph-meter",
    `cph-meter--${resolvedTone}`,
    compact ? "cph-meter--compact" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Meter
      minValue={0}
      maxValue={max}
      value={abs}
      valueLabel={signedText}
      aria-label={resolvedAriaLabel}
      className={meterClassName}
    >
      {({ percentage, valueText }) => (
        <>
          <div className="cph-meter__meta">
            <span>{label}</span>
            <span>{valueText}</span>
          </div>
          <div className="cph-meter__track">
            <div className="cph-meter__fill" style={{ width: `${Math.min(100, percentage)}%` }} />
          </div>
        </>
      )}
    </Meter>
  );
}
