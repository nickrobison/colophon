/**
 * Validation helpers for Colophon forms.
 *
 * Every helper returns a human-readable, specific message on failure and
 * `undefined` on success, so a caller can `return` the result straight out of
 * a validator. The spec forbids bare messages like "Invalid input".
 *
 * These are pure functions with no React dependency.
 */

/** Presence: the field must have a non-whitespace value. */
export function required(message = "This field is required.") {
  return (value: unknown): string | undefined => {
    if (value === null || value === undefined) return message;
    if (typeof value === "string" && value.trim() === "") return message;
    return undefined;
  };
}

/**
 * Email shape check. Deliberately permissive: one @, a dot in the domain, no
 * spaces. Stricter RFC validation is the server's job, not the client's.
 *
 * An empty string is rejected (it has no `@`); pair with `required` when the
 * field is optional.
 */
export function email(message = "Enter a valid email address.") {
  return (value: string): string | undefined => {
    if (/\s/.test(value)) return message;
    const at = value.indexOf("@");
    if (at <= 0) return message; // no @, or @ at the very start
    // Only the first @ separates local part from domain, so a second one means
    // the value is not a single address: "name@@x.org" and "name@x@y.org" both
    // slipped through when only indexOf was checked.
    if (value.indexOf("@", at + 1) !== -1) return message;
    const domain = value.slice(at + 1);
    if (!domain.includes(".")) return message;
    return undefined;
  };
}

/**
 * Inclusive numeric range.
 *
 * Non-finite numbers (NaN, Infinity, -Infinity) are treated as invalid and
 * produce the failure message — they cannot meaningfully satisfy a bounded
 * range.
 */
export function range(min: number, max: number, message?: string) {
  const msg = message ?? `Enter a value between ${min} and ${max}.`;
  return (value: number): string | undefined => {
    if (!Number.isFinite(value)) return msg;
    if (value < min || value > max) return msg;
    return undefined;
  };
}

/**
 * Minimum string length. An empty string returns `undefined` (use `required`
 * for presence — do not duplicate that concern here).
 */
export function minLength(min: number, message?: string) {
  const msg = message ?? `Enter at least ${min} characters.`;
  return (value: string): string | undefined => {
    if (value === "") return undefined;
    if (value.length < min) return msg;
    return undefined;
  };
}

/**
 * Maximum string length. An empty string returns `undefined`.
 */
export function maxLength(max: number, message?: string) {
  const msg = message ?? `Enter at most ${max} characters.`;
  return (value: string): string | undefined => {
    if (value.length > max) return msg;
    return undefined;
  };
}

/**
 * Cross-field: `end` must fall on or after `start`. Values are ISO
 * `yyyy-mm-dd` strings or null/undefined for "not filled in yet" — a missing
 * end date is NOT an error here, because the caller decides whether that is
 * required.
 *
 * ISO `yyyy-mm-dd` strings compare correctly with plain lexicographic ordering,
 * so no date parsing is needed.
 */
export function dateRange(
  start: string | null | undefined,
  message = "Choose an end date that falls on or after the start date.",
) {
  return (end: string | null | undefined): string | undefined => {
    if (end === null || end === undefined || end === "") return undefined;
    if (start === null || start === undefined || start === "") return undefined;
    if (end < start) return message;
    return undefined;
  };
}

/**
 * One year past today is a reasonable upper bound for a "publication year".
 * Accepts a 4-digit string year between 1400 and 2025 inclusive.
 */
export function pastYear(message = "Enter a year between 1400 and 2025.") {
  return (value: string): string | undefined => {
    if (!/^\d{4}$/.test(value)) return message;
    const year = Number(value);
    if (year < 1400 || year > 2025) return message;
    return undefined;
  };
}
