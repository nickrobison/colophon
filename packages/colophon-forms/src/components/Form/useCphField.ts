import { useField, type DeepKeys, type DeepValue } from "@tanstack/react-form";

import { toValidator } from "./toValidator";
import type { CphFormApi } from "./useCphForm";

/**
 * The package's DOM-id convention: `<name>-field`.
 *
 * `CphErrorSummary` links point at these ids, so a field rendered through
 * `useCphField` and a summary rendered by `CphForm` agree by default.
 */
export const cphFieldId = (fieldName: string): string => `${fieldName}-field`;

/** When the interactive validation pass runs. Submit always validates too. */
export type CphFieldValidateOn = "blur" | "change";

export interface UseCphFieldOptions<TValue> {
  /**
   * Raw Colophon validators — they take the bare value, exactly as written in
   * `validation/validators.ts`. Wrapping in `toValidator` happens here, so a
   * validator can never silently fail by receiving TanStack's context object.
   */
  validators?: Array<(value: TValue) => string | undefined>;
  /**
   * When the interactive (non-submit) pass runs: `"blur"` (default) or
   * `"change"`. The validators always run on submit as well, so untouched
   * fields still surface their errors when the form is submitted.
   */
  validateOn?: CphFieldValidateOn;
}

export interface CphFieldBindProps<TValue> {
  /** The `<name>-field` convention; override by setting `id` after the spread. */
  id: string;
  value: TValue;
  onChange: (value: TValue) => void;
  onBlur: () => void;
}

function adaptValidators<TValue>(
  validators: ReadonlyArray<(value: TValue) => string | undefined>,
): ((ctx: { value: TValue }) => string | string[] | undefined) | undefined {
  const [first, ...rest] = validators;
  if (!first) return undefined;
  if (rest.length === 0) return toValidator(first);
  return (ctx) => {
    const messages = [first, ...rest]
      .map((validate) => toValidator(validate)(ctx))
      .filter((message): message is string => Boolean(message));
    return messages.length > 0 ? messages : undefined;
  };
}

/**
 * Binds one field of a `useCphForm` (or any TanStack) form to a `CphField`,
 * replacing the manual `form.Field` render-prop boilerplate:
 *
 * ```tsx
 * const title = useCphField(form, "title", {
 *   validators: [required("Give the inquiry a title.")],
 * });
 * return <CphField {...title.props} label="Inquiry title" />;
 * ```
 *
 * Wrapping in `toValidator` and the validate-on-blur-then-submit timing are
 * library defaults, so they can no longer be missed per call site. The return
 * also exposes the raw TanStack `field` (whose type is inferred from the form)
 * for advanced wiring.
 */
export function useCphField<TValues, TName extends DeepKeys<TValues>>(
  form: CphFormApi<TValues>,
  name: TName,
  options: UseCphFieldOptions<DeepValue<TValues, TName>> = {},
) {
  const { validators = [], validateOn = "blur" } = options;
  const interactive = adaptValidators(validators);

  const field = useField({
    form,
    name,
    validators: {
      ...(interactive && validateOn === "blur" ? { onBlur: interactive } : {}),
      ...(interactive && validateOn === "change" ? { onChange: interactive } : {}),
      ...(interactive ? { onSubmit: interactive } : {}),
    },
  });

  return {
    field,
    props: {
      id: cphFieldId(name),
      value: field.state.value,
      onChange: (value: DeepValue<TValues, TName>) => field.handleChange(value),
      onBlur: () => field.handleBlur(),
    },
  };
}
