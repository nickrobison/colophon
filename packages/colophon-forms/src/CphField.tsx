import { TriangleAlert } from "lucide-react";
import { FieldError, Input, Label, TextField, type TextFieldProps } from "react-aria-components";
export interface CphFieldProps extends TextFieldProps {
  label: string;
  hint?: string;
}
export function CphField({ label, hint, ...rest }: CphFieldProps) {
  return (
    <TextField {...rest} className="cph-field">
      <Label className="cph-field__label">{label}</Label>
      <Input className="cph-field__input" />
      {hint && <span className="cph-field__hint">{hint}</span>}
      <FieldError className="cph-field__error">
        {({ validationDetails }) => (
          <>
            <TriangleAlert size={14} aria-hidden="true" />{" "}
            {validationDetails.customError || "Invalid value"}
          </>
        )}
      </FieldError>
    </TextField>
  );
}
