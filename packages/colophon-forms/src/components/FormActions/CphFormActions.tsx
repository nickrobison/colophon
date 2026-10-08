import type { ReactElement, ReactNode } from "react";
import { Button } from "react-aria-components";

export interface CphFormActionsProps {
  /** Dirty = there are unsaved changes. Drives draft-status text and opt-in discard confirmation. */
  isDirty: boolean;
  /** Disables the submit button while a submit is in flight. */
  isSubmitting?: boolean;
  /** Called when Back is activated, unless an enabled discard confirmation is cancelled.
   * Without `confirmDiscard`, callers must confirm before resetting or navigating
   * away from unsaved changes.
   *
   * Widened to
   * `(() => void) | undefined` so an absent handler can be passed explicitly
   * under `exactOptionalPropertyTypes`. */
  onDiscard?: (() => void) | undefined;
  /** Opt in to confirmation before discarding dirty edits. `true` uses
   * "Discard unsaved changes?"; a string supplies custom copy. Defaults to `false`.
   * Clean forms never prompt. Leave disabled to implement a custom confirmation flow. */
  confirmDiscard?: boolean | string;
  /** Submit button label, e.g. "Save & continue". */
  submitLabel?: string;
  /** Optional node rendered before the submit button, e.g. a CphSaveIndicator. */
  children?: ReactNode;
  className?: string;
}

export function CphFormActions(props: CphFormActionsProps): ReactElement {
  const {
    isDirty,
    isSubmitting = false,
    onDiscard,
    confirmDiscard = false,
    submitLabel = "Save",
    children,
    className = "",
  } = props;

  return (
    <footer className={`cph-form__actions ${className}`}>
      {onDiscard && (
        <Button
          className="cph-form__discard"
          type="button"
          onPress={() => {
            if (
              isDirty &&
              confirmDiscard !== false &&
              !window.confirm(
                typeof confirmDiscard === "string" ? confirmDiscard : "Discard unsaved changes?",
              )
            ) {
              return;
            }
            onDiscard();
          }}
        >
          Back
        </Button>
      )}
      <span className="cph-form__draft">{isDirty ? "Unsaved changes" : "Draft up to date"}</span>
      {children}
      <Button className="cph-form__submit" type="submit" isDisabled={isSubmitting}>
        {isSubmitting ? "Saving…" : submitLabel}
      </Button>
    </footer>
  );
}
