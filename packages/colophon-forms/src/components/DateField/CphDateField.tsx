import { TriangleAlert } from "lucide-react";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import {
  DateField,
  DateInput,
  DateSegment,
  FieldError,
  Group,
  Label,
  Text,
} from "react-aria-components";

import type { CphFieldMarker } from "../Field/CphField";

export type CphDateValue = NonNullable<ComponentProps<typeof DateField>["value"]> | null;

export interface CphDateFieldProps {
  label: string;
  help?: ReactNode;
  marker?: CphFieldMarker;
  value?: CphDateValue;
  defaultValue?: CphDateValue;
  onChange?: (value: CphDateValue) => void;
  validate?: ComponentProps<typeof DateField>["validate"];
  isDisabled?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  isReadOnly?: boolean;
  name?: string;
  className?: string;
}

export function CphDateField(props: CphDateFieldProps): ReactElement {
  const {
    label,
    help,
    marker,
    value,
    defaultValue,
    onChange,
    validate,
    isDisabled,
    isRequired,
    isInvalid,
    isReadOnly,
    name,
    className = "",
  } = props;

  const forwarded: Partial<ComponentProps<typeof DateField>> = {
    ...(value !== undefined && { value }),
    ...(defaultValue !== undefined && { defaultValue }),
    ...(onChange !== undefined && { onChange }),
    ...(validate !== undefined && { validate }),
    ...(isDisabled !== undefined && { isDisabled }),
    ...(isRequired !== undefined && { isRequired }),
    ...(isInvalid !== undefined && { isInvalid }),
    ...(isReadOnly !== undefined && { isReadOnly }),
    ...(name !== undefined && { name }),
  };

  return (
    <DateField validationBehavior="aria" {...forwarded} className={`cph-field ${className}`}>
      <div className="cph-field__label-line">
        <Label className="cph-field__label">{label}</Label>
        {marker && (
          <span className="cph-field__marker">
            {marker === "required" ? "Required" : "Optional"}
          </span>
        )}
      </div>
      {help && (
        <Text slot="description" className="cph-field__help">
          {help}
        </Text>
      )}
      <Group className="cph-field__control cph-field__date-group">
        <DateInput className="cph-field__date-input">
          {(segment) => <DateSegment segment={segment} className="cph-field__date-segment" />}
        </DateInput>
      </Group>
      <FieldError className="cph-field__error">
        {({ validationErrors }) => (
          <span role="alert">
            <TriangleAlert size={14} aria-hidden="true" />{" "}
            {validationErrors[0] ?? "Enter a valid date."}
          </span>
        )}
      </FieldError>
    </DateField>
  );
}
