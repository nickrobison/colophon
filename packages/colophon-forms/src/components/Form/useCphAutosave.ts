import { useEffect, useRef, useState } from "react";
import { useSelector, type AnyFormApi } from "@tanstack/react-form";

import type { CphSaveState } from "../SaveIndicator/CphSaveIndicator";

/** Quiet period after the last keystroke before an autosave fires. */
export const CPH_AUTOSAVE_DEBOUNCE_MS = 650;
/** How long the "Saved" confirmation stays visible before returning to idle. */
export const CPH_AUTOSAVE_RECEIPT_MS = 2000;
/** Fallback when a rejected save carries no usable message. */
export const CPH_AUTOSAVE_ERROR_MESSAGE = "Couldn't save — retry";

export interface CphAutosaveResult {
  state: CphSaveState;
  /**
   * Present only while `state` is `"error"`.
   *
   * Declared as `string | undefined` rather than plain `string` because the
   * package sets `exactOptionalPropertyTypes`, which forbids assigning an
   * explicit `undefined` to an optional member declared without it.
   */
  errorMessage?: string | undefined;
}

export interface CphAutosaveOptions<TValues> {
  /** The TanStack form to watch. Only its values and dirty flag are observed. */
  form: AnyFormApi;
  /** Persists the current values. A rejected promise moves the state to `"error"`. */
  onSave: (values: TValues) => void | Promise<void>;
  /** Set false for explicit-save forms; `schedule` then never fires. */
  enabled?: boolean;
}

/**
 * Debounced autosave for a TanStack form.
 *
 * Selects `values` rather than the whole form state on purpose: subscribing to
 * the full state would restart the debounce on unrelated transitions such as a
 * field becoming touched or blurred, persisting work the user never changed.
 *
 * The initial mount is gated on `isDirty` so untouched default values are never
 * written back to the server.
 */
export function useCphAutosave<TValues>(
  options: CphAutosaveOptions<TValues>,
): CphAutosaveResult {
  const { form, onSave, enabled = true } = options;
  const [state, setState] = useState<CphSaveState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const values = useSelector(form.store, (s) => s.values) as TValues;
  const isDirty = useSelector(form.store, (s) => s.isDirty);

  // The receipt timer outlives the debounce timer it was created inside, so it
  // needs its own handle to be cleared when a newer change supersedes it.
  const receiptTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled || !isDirty) return;

    // Guards the async continuation below: unmounting mid-request must not
    // resurrect a torn-down component.
    let cancelled = false;

    const debounceTimer = setTimeout(() => {
      setState("saving");
      setErrorMessage(undefined);

      void Promise.resolve(onSave(values)).then(
        () => {
          if (cancelled) return;
          setState("saved");
          receiptTimer.current = setTimeout(() => {
            if (!cancelled) setState("idle");
          }, CPH_AUTOSAVE_RECEIPT_MS);
        },
        (error: unknown) => {
          if (cancelled) return;
          setState("error");
          setErrorMessage(
            error instanceof Error ? error.message : CPH_AUTOSAVE_ERROR_MESSAGE,
          );
        },
      );
    }, CPH_AUTOSAVE_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(debounceTimer);
      if (receiptTimer.current !== null) {
        clearTimeout(receiptTimer.current);
        receiptTimer.current = null;
      }
    };
  }, [values, isDirty, enabled, onSave]);

  return { state, errorMessage };
}
