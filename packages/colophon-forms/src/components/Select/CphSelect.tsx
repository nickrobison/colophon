import type { ReactElement, ReactNode } from "react";
import { ChevronDown, TriangleAlert } from "lucide-react";
import {
  Button,
  FieldError,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
  Text,
  type SelectProps,
  type SelectRenderProps,
} from "react-aria-components";
import type { CphFieldMarker } from "../Field/CphField";
import { composeClassName } from "../../utils/composeClassName";

export interface CphSelectOption {
  value: string;
  label: string;
}

export interface CphSelectProps
  extends Omit<SelectProps, "children" | "items"> {
  label: string;
  help?: ReactNode;
  marker?: CphFieldMarker;
  options: readonly CphSelectOption[];
  placeholder?: string;
}

export function CphSelect(props: CphSelectProps): ReactElement {
  const { label, help, marker, options, placeholder, className, ...rest } = props;
  return (
    <Select
      {...rest}
      {...(placeholder ? { placeholder } : {})}
      validationBehavior="aria"
      className={composeClassName<SelectRenderProps>("cph-field", className)}
    >
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
      <Button className="cph-field__control cph-field__select-trigger">
        <SelectValue />
        <ChevronDown className="cph-field__select-icon" aria-hidden="true" size={16} />
      </Button>
      <FieldError className="cph-field__error">
        {({ validationErrors }) => (
          <span role="alert">
            <TriangleAlert size={14} aria-hidden="true" />{" "}
            {validationErrors[0] ?? "Choose an option."}
          </span>
        )}
      </FieldError>
      <Popover>
        <ListBox>
          {options.map((option) => (
            <ListBoxItem key={option.value} id={option.value} textValue={option.label}>
              {option.label}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </Select>
  );
}
