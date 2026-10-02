import type { ReactElement, ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { Checkbox, Label, type CheckboxProps } from "react-aria-components";

export interface CphCheckboxProps extends Omit<CheckboxProps, "children"> {
  label: string;
  help?: string;
  errorMessage?: ReactNode;
}

export function CphCheckbox(props: CphCheckboxProps): ReactElement {
  const { label, help, errorMessage, className = "", ...rest } = props;
  return (
    <div className={`cph-choice cph-choice--checkbox ${className}`}>
      <Checkbox {...rest}>
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
      {help && <p className="cph-field__help">{help}</p>}
      {errorMessage && (
        <span className="cph-field__error" role="alert">
          <TriangleAlert size={14} aria-hidden="true" /> {errorMessage}
        </span>
      )}
    </div>
  );
}
