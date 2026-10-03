import type { ReactElement, ReactNode } from "react";
import { Button } from "react-aria-components";

export interface CphFormActionsProps {
  /** Dirty = there are unsaved changes. Drives the draft-status text. */
  isDirty: boolean;
  /** Disables the submit button while a submit is in flight. */
  isSubmitting?: boolean;
  /** Called when the discard/back affordance is used. Widened to
   * `(() => void) | undefined` so an absent handler can be passed explicitly
   * under `exactOptionalPropertyTypes`. */
  onDiscard?: (() => void) | undefined;
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
    submitLabel = "Save",
    children,
    className = "",
  } = props;

  return (
    <footer className={`cph-form__actions ${className}`}>
      {onDiscard && (
        <Button className="cph-form__discard" type="button" onPress={onDiscard}>
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
