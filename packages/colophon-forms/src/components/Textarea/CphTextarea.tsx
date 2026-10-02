import type { ReactElement } from "react";
import { TriangleAlert } from "lucide-react";
import {
  FieldError,
  Label,
  TextArea,
  TextField,
  type TextFieldProps,
} from "react-aria-components";
import type { CphFieldMarker } from "../Field/CphField";

export interface CphTextareaProps extends Omit<TextFieldProps, "children"> {
  label: string;
  help?: string;
  marker?: CphFieldMarker;
  rows?: number;
}

export function CphTextarea(props: CphTextareaProps): ReactElement {
  const { label, help, marker, rows = 5, className = "", ...rest } = props;

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
      <TextArea className="cph-field__control" rows={rows} />
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
