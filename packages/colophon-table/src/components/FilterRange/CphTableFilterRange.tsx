import type { ReactElement } from "react";
import { Input, Label } from "react-aria-components";

export interface CphTableFilterRangeValue {
  min?: number | undefined;
  max?: number | undefined;
}

export interface CphTableFilterRangeProps {
  /** Controlled bounds (either side optional). */
  value?: CphTableFilterRangeValue | undefined;
  /** Called when either bound changes. Omitted keys mean "no bound". */
  onValueChange?: ((value: CphTableFilterRangeValue) => void) | undefined;
  /** Visible label; also the accessible name when no `aria-label` is given. */
  label?: string | undefined;
  /** Lower bound of the allowed range (native `min`). */
  min?: number | undefined;
  /** Upper bound of the allowed range (native `max`). */
  max?: number | undefined;
  /** Step increment (native `step`). Defaults to `1`. */
  step?: number | undefined;
  /** Placeholders for the min/max inputs. */
  placeholder?: { min?: string | undefined; max?: string | undefined } | undefined;
  /** Overrides the accessible name derived from `label`. */
  "aria-label"?: string | undefined;
  className?: string | undefined;
}

function parseBound(raw: string): number | undefined {
  if (raw.trim() === "") {
    return undefined;
  }
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? undefined : parsed;
}

/**
 * Numeric range filter: two spinbutton inputs (min / max) in a dense row.
 *
 * Both bounds are optional — an empty input means "no bound" and the key is
 * omitted from the emitted value (never set to `undefined`, per
 * `exactOptionalPropertyTypes`).
 */
export function CphTableFilterRange({
  value,
  onValueChange,
  label,
  min,
  max,
  step = 1,
  placeholder,
  "aria-label": ariaLabel,
  className = "",
}: CphTableFilterRangeProps): ReactElement {
  const accessibleName = ariaLabel ?? label ?? "Filter by range";

  const emit = (bound: "min" | "max", raw: string) => {
    const next: CphTableFilterRangeValue = { ...value };
    const parsed = parseBound(raw);
    if (parsed === undefined) {
      delete next[bound];
    } else {
      next[bound] = parsed;
    }
    onValueChange?.(next);
  };

  return (
    <div
      className={`cph-table__filter-range ${className}`}
      role="group"
      aria-label={accessibleName}
      data-testid="filter-range"
    >
      {label && (
        <Label className="cph-table__filter-range__label" data-testid="filter-range-label">
          {label}
        </Label>
      )}
      <Input
        type="number"
        className="cph-table__filter-range__input"
        aria-label={label ? `${label} min` : `${accessibleName} min`}
        data-testid="filter-range-min"
        value={value?.min === undefined ? "" : String(value.min)}
        onChange={(event) => emit("min", event.target.value)}
        {...(min === undefined ? {} : { min })}
        {...(max === undefined ? {} : { max })}
        {...(step === undefined ? {} : { step })}
        {...(placeholder?.min === undefined ? {} : { placeholder: placeholder.min })}
      />
      <span className="cph-table__filter-range__sep" aria-hidden="true">
        –
      </span>
      <Input
        type="number"
        className="cph-table__filter-range__input"
        aria-label={label ? `${label} max` : `${accessibleName} max`}
        data-testid="filter-range-max"
        value={value?.max === undefined ? "" : String(value.max)}
        onChange={(event) => emit("max", event.target.value)}
        {...(min === undefined ? {} : { min })}
        {...(max === undefined ? {} : { max })}
        {...(step === undefined ? {} : { step })}
        {...(placeholder?.max === undefined ? {} : { placeholder: placeholder.max })}
      />
    </div>
  );
}
