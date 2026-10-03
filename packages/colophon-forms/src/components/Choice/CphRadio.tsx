import { TriangleAlert } from "lucide-react";
import type { ReactElement, ReactNode } from "react";
import {
  FieldError,
  Label,
  Radio,
  RadioGroup,
  Text,
  type RadioGroupProps,
} from "react-aria-components";

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
  const { legend, help, options, errorMessage, className, ...rest } = props;
  return (
    <div className="cph-choice-group">
      <RadioGroup
        {...rest}
        {...(className ? { className } : {})}
        {...(errorMessage === undefined ? {} : { isInvalid: true })}
      >
        <Label className="cph-choice-group__legend">{legend}</Label>
        {help && (
          <Text slot="description" className="cph-field__help">
            {help}
          </Text>
        )}
        {options.map((option) => (
          <Radio key={option.value} value={option.value} className="cph-choice">
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
                  <span className="cph-choice__description">{option.description}</span>
                )}
              </>
            )}
          </Radio>
        ))}
        {/* FieldError registers on the group's aria-describedby, but renders
            only while React Aria considers the group invalid, so a supplied
            errorMessage has to imply isInvalid. Only one slot="description"
            is registered — a second one is silently dropped. */}
        {errorMessage && (
          <FieldError className="cph-field__error">
            <span role="alert">
              <TriangleAlert size={14} aria-hidden="true" /> {errorMessage}
            </span>
          </FieldError>
        )}
      </RadioGroup>
    </div>
  );
}
