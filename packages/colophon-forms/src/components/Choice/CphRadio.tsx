import type { ReactElement, ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { Label, Radio, RadioGroup, type RadioGroupProps } from "react-aria-components";

export interface CphRadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface CphRadioProps extends Omit<RadioGroupProps, "children"> {
  legend: string;
  help?: string;
  options: readonly CphRadioOption[];
  errorMessage?: ReactNode;
}

export function CphRadio(props: CphRadioProps): ReactElement {
  const { legend, help, options, errorMessage, className = "", ...rest } = props;
  return (
    <div className={`cph-choice-group ${className}`}>
      <RadioGroup {...rest}>
        <Label className="cph-choice-group__legend">{legend}</Label>
        {help && <p className="cph-field__help">{help}</p>}
        {options.map((option) => (
          <Radio
            key={option.value}
            value={option.value}
            className="cph-choice"
          >
            {({ isSelected }) => (
              <>
                <span
                  className={`cph-choice__mark cph-choice__mark--radio${
                    isSelected ? " cph-choice__mark--selected" : ""
                  }`}
                  aria-hidden="true"
                />
                <Label className="cph-choice__label">{option.label}</Label>
                {option.description && (
                  <span className="cph-choice__description">
                    {option.description}
                  </span>
                )}
              </>
            )}
          </Radio>
        ))}
      </RadioGroup>
      {errorMessage && (
        <span className="cph-field__error" role="alert">
          <TriangleAlert size={14} aria-hidden="true" /> {errorMessage}
        </span>
      )}
    </div>
  );
}
