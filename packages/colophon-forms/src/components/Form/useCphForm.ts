import {
  useForm,
  isGlobalFormValidationError,
  isStandardSchemaValidator,
  type FormValidateFn,
  type FormValidateOrFn,
  type FormAsyncValidateOrFn,
  type ReactFormExtendedApi,
} from "@tanstack/react-form";

import { useCphAutosave, type CphAutosaveResult } from "./useCphAutosave";

/**
 * The form instance handed to `CphForm` children and returned by `useCphForm`.
 *
 * The validator generics are widened because validators are forwarded
 * dynamically and cannot be known at the type level. This mirrors TanStack's
 * own `AnyFormApi` convention; `TValues` stays precise so `form.Field` and
 * `defaultValues` remain fully typed at the call site.
 */
export type CphFormApi<TValues> =
  // oxlint-disable typescript/no-explicit-any -- the eleven validator generics
  // must be widened as a block; see the note above.
  ReactFormExtendedApi<TValues, any, any, any, any, any, any, any, any, any, any, any>;

export interface CphFormValidators<TValues> {
  onChange?: FormValidateOrFn<TValues>;
  onBlur?: FormValidateOrFn<TValues>;
  onSubmit?: FormValidateOrFn<TValues>;
  onSubmitAsync?: FormAsyncValidateOrFn<TValues>;
}

export interface CphFormAutosave<TValues> {
  /**
   * Persists the form values. Return a promise that settles after the write
   * completes: autosaves are serialized per form and pending edits coalesce to
   * the latest values. Rejecting surfaces the `"error"` save state.
   */
  onSave: (values: TValues) => void | Promise<void>;
}

export interface UseCphFormOptions<TValues> {
  /** Seed values for the form. Also fixes the shape of every field name. */
  defaultValues: TValues;
  /** Called with the values once validation passes. */
  onSubmit: (values: TValues) => void | Promise<void>;
  /** Inline validators. On submit, `schema` runs first, then `validators.onSubmit`. */
  validators?: CphFormValidators<TValues>;
  /**
   * Optional Standard Schema (e.g. a Zod schema) applied on submit.
   *
   * Uses TanStack's native Standard Schema support. When an inline submit
   * validator is also supplied, neither source takes precedence.
   */
  schema?: FormValidateOrFn<TValues>;
  /** Omit to disable autosave; pair with `explicitSave` for a manual-save form. */
  autosave?: CphFormAutosave<TValues>;
  /** Set true to suppress autosave even when `autosave` is supplied. */
  explicitSave?: boolean;
}

export interface UseCphFormResult<TValues> {
  /** The TanStack form instance. Pass it to `useCphField` or render `form.Field`. */
  form: CphFormApi<TValues>;
  /** Save state for `CphSaveIndicator`; idle unless `autosave` is supplied. */
  autosave: CphAutosaveResult;
}

function composeSubmitValidators<TValues>(
  schema: FormValidateOrFn<TValues>,
  inline: FormValidateOrFn<TValues>,
): FormValidateFn<TValues> {
  return (context) => {
    // Standard Schema implementations may be callable, so the schema check must
    // win over the function check; otherwise they are invoked with the validator
    // context and their issues are lost.
    const results = [schema, inline].map((validator) =>
      isStandardSchemaValidator(validator)
        ? context.formApi.parseValuesWithSchema(validator)
        : validator(context),
    );
    if (!results.some(Boolean)) return undefined;

    const formErrors: unknown[] = [];
    const fieldErrors = new Map<string, unknown[]>();
    for (const result of results) {
      if (!result) continue;
      if (isGlobalFormValidationError(result)) {
        if (result.form) formErrors.push(result.form);
        for (const [name, error] of Object.entries(result.fields ?? {})) {
          if (!error) continue;
          // Root issues must not create a phantom field that cannot clear on edits.
          if (name === "") {
            const mirroredInForm =
              result.form && typeof result.form === "object" && Object.hasOwn(result.form, "");
            if (!mirroredInForm) formErrors.push({ fields: { "": error } });
          } else {
            fieldErrors.set(name, [...(fieldErrors.get(name) ?? []), error].flat());
          }
        }
      } else {
        formErrors.push(
          typeof result === "object" && "form" in result
            ? { form: result.form, fields: {} }
            : result,
        );
      }
    }
    return {
      form: formErrors.length ? formErrors : undefined,
      fields: Object.fromEntries(fieldErrors),
    };
  };
}

/**
 * Owns the single `useForm` wiring for the package: TanStack's form plus the
 * Colophon defaults — Standard Schema composition with inline validators, and
 * serialized debounced autosave.
 *
 * Use it directly when the form instance must live outside `CphForm`'s render
 * prop (a submit button in a parent header, programmatic submission); otherwise
 * `CphForm` wraps it and adds the error summary and action footer.
 */
export function useCphForm<TValues>(
  options: UseCphFormOptions<TValues>,
): UseCphFormResult<TValues> {
  const { defaultValues, onSubmit, validators, schema, autosave, explicitSave = false } = options;

  const form = useForm({
    defaultValues,
    validators: {
      ...validators,
      ...(schema
        ? {
            onSubmit: validators?.onSubmit
              ? composeSubmitValidators(schema, validators.onSubmit)
              : schema,
          }
        : {}),
    },
    onSubmit: async ({ value }: { value: TValues }) => {
      await onSubmit(value);
    },
  });

  const autosaveResult = useCphAutosave<TValues>({
    form,
    onSave: autosave?.onSave ?? (() => undefined),
    enabled: Boolean(autosave) && !explicitSave,
  });

  return { form: form as unknown as CphFormApi<TValues>, autosave: autosaveResult };
}
