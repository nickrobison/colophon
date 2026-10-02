import type { ReactElement } from "react";
import { TriangleAlert } from "lucide-react";
import {
  FieldError,
  Input,
  Label,
  TextField,
  type TextFieldProps,
} from "react-aria-components";

export type CphFieldMarker = "required" | "optional";

export interface CphFieldProps extends Omit<TextFieldProps, "children"> {
  label: string;
  help?: string;
  marker?: CphFieldMarker;
}

export function CphField(props: CphFieldProps): ReactElement {
  const { label, help, marker, className = "", ...rest } = props;

  return (
    <TextField
      {...rest}
      validationBehavior="aria"
      className={`cph-field ${className}`}
    >
      <div className="cph-field__label-line">
        <Label className="cph-field__label">{label}</Label>
        {marker && (
          <span className="cph-field__marker">
            {marker === "required" ? "Required" : "Optional"}
          </span>
        )}
      </div>
      {help && <p className="cph-field__help">{help}</p>}
      <Input className="cph-field__control" />
      <FieldError className="cph-field__error">
        {({ validationErrors }) => (
          <span role="alert">
            <TriangleAlert size={14} aria-hidden="true" />{" "}
            {validationErrors[0] ?? "Enter a valid value."}
          </span>
        )}
      </FieldError>
    </TextField>
  );
}