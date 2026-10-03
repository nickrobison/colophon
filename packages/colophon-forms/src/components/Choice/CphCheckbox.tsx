import { useId, type ReactElement, type ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { Checkbox, Label, Text, type CheckboxProps } from "react-aria-components";

export interface CphCheckboxProps extends Omit<CheckboxProps, "children"> {
  label: string;
  help?: string;
  errorMessage?: ReactNode;
}

export function CphCheckbox(props: CphCheckboxProps): ReactElement {
  const { label, help, errorMessage, className = "", ...rest } = props;
  // Checkbox has no description slot, so help and error are wired through
  // aria-describedby with stable IDs. They are merged with any caller-supplied
  // value rather than replacing it, and the error is omitted from the
  // description while React Aria is already announcing it via role="alert".
  const helpId = useId();
  const errorId = useId();
  const describedBy =
    [help ? helpId : null, errorMessage ? errorId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div className={`cph-choice cph-choice--checkbox ${className}`}>
      <Checkbox
        {...rest}
        {...(describedBy === undefined ? {} : { "aria-describedby": describedBy })}
      >
        {({ isSelected }) => (
          <>
            <span className="cph-choice__input-wrap">
              <span
                className={`cph-choice__mark cph-choice__mark--checkbox${
                  isSelected ? " cph-choice__mark--selected" : ""
                }`}
                aria-hidden="true"
              />
              <Label className="cph-choice__label">{label}</Label>
            </span>
          </>
        )}
      </Checkbox>
      {help && (
        <Text id={helpId} className="cph-field__help">
          {help}
        </Text>
      )}
      {errorMessage && (
        <Text id={errorId} className="cph-field__error" role="alert">
          <TriangleAlert size={14} aria-hidden="true" /> {errorMessage}
        </Text>
      )}
    </div>
  );
}
