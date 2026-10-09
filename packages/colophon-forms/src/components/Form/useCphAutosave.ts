import { useSelector, type AnyFormApi } from "@tanstack/react-form";
import { useEffect, useRef, useState } from "react";

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
  /**
   * Persists the current values. Must settle only after the write completes.
   * Saves are serialized per hook instance, with pending edits coalesced to the
   * latest values. A rejected promise moves the state to `"error"`.
   */
  onSave: (values: TValues) => void | Promise<void>;
  /** Set false for explicit-save forms; pending saves are then discarded. */
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
 * written back to the server. Once a write starts, reverting to defaults must
 * also be persisted. Pending saves are discarded on disable or unmount; an
 * already dispatched write cannot be cancelled.
 */
export function useCphAutosave<TValues>(options: CphAutosaveOptions<TValues>): CphAutosaveResult {
  const { form, onSave, enabled = true } = options;
  const [state, setState] = useState<CphSaveState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const values = useSelector(form.store, (s) => s.values) as TValues;
  const isDirty = useSelector(form.store, (s) => s.isDirty);

  // The receipt timer outlives the debounce timer it was created inside, so it
  // needs its own handle to be cleared when a newer change supersedes it.
  const receiptTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onSaveRef = useRef(onSave);
  const inFlight = useRef(false);
  const hasStartedSave = useRef(false);
  // Only debounce-ready values are queued; newer edits replace this continuation.
  const pendingSave = useRef<(() => void) | null>(null);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    if (!enabled || (!isDirty && !hasStartedSave.current)) return;
    setState(inFlight.current ? "saving" : "idle");
    setErrorMessage(undefined);

    // Guards the async continuation below: unmounting mid-request must not
    // resurrect a torn-down component.
    let cancelled = false;

    const save = () => {
      pendingSave.current = null;
      inFlight.current = true;
      hasStartedSave.current = true;
      setState("saving");
      setErrorMessage(undefined);

      const finish = (failed: boolean, error?: unknown) => {
        inFlight.current = false;
        if (pendingSave.current !== null) {
          pendingSave.current();
          return;
        }
        if (cancelled) return;
        if (failed) {
          setState("error");
          setErrorMessage(error instanceof Error ? error.message : CPH_AUTOSAVE_ERROR_MESSAGE);
        } else {
          setState("saved");
          receiptTimer.current = setTimeout(() => {
            if (!cancelled) setState("idle");
          }, CPH_AUTOSAVE_RECEIPT_MS);
        }
      };

      void Promise.resolve()
        .then(() => onSaveRef.current(values))
        .then(
          () => finish(false),
          (error: unknown) => finish(true, error),
        );
    };

    const debounceTimer = setTimeout(() => {
      if (inFlight.current) {
        pendingSave.current = save;
      } else {
        save();
      }
    }, CPH_AUTOSAVE_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      pendingSave.current = null;
      clearTimeout(debounceTimer);
      if (receiptTimer.current !== null) {
        clearTimeout(receiptTimer.current);
        receiptTimer.current = null;
      }
    };
  }, [values, isDirty, enabled]);

  return { state, errorMessage };
}
