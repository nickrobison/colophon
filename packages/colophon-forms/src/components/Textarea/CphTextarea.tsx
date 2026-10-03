import { TriangleAlert } from "lucide-react";
import type { ReactElement } from "react";
import {
  Text,
  FieldError,
  Label,
  TextArea,
  TextField,
  type TextFieldProps,
  type TextFieldRenderProps,
} from "react-aria-components";

import { composeClassName } from "../../utils/composeClassName";
import type { CphFieldMarker } from "../Field/CphField";

export interface CphTextareaProps extends Omit<TextFieldProps, "children"> {
  label: string;
  help?: string;
  marker?: CphFieldMarker;
  rows?: number;
}

export function CphTextarea(props: CphTextareaProps): ReactElement {
  const { label, help, marker, rows = 5, className, ...rest } = props;

  return (
    <TextField
      {...rest}
      validationBehavior="aria"
      className={composeClassName<TextFieldRenderProps>("cph-field", className)}
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
