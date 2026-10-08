import type { ReactElement, ReactNode } from "react";
import { Button } from "react-aria-components";

export interface CphFormActionsProps {
  /** Dirty = there are unsaved changes. Drives only the draft-status text, not discard confirmation. */
  isDirty: boolean;
  /** Disables the submit button while a submit is in flight. */
  isSubmitting?: boolean;
  /** Called unconditionally when Back is activated, even when `isDirty` is true.
   * No confirmation is shown. Callers must confirm before resetting or navigating
   * away from unsaved changes; the host application owns the copy and flow.
   *
   * Widened to
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
