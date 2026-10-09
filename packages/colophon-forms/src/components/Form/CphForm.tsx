import {
  useForm,
  isGlobalFormValidationError,
  type FormValidateFn,
  type FormValidateOrFn,
  type FormAsyncValidateOrFn,
  type ReactFormExtendedApi,
} from "@tanstack/react-form";
import { useId, type ReactElement, type ReactNode } from "react";

import { CphErrorSummary, type CphErrorSummaryEntry } from "../ErrorSummary/CphErrorSummary";
import { CphFormActions, type CphFormActionsProps } from "../FormActions/CphFormActions";
import { CphSaveIndicator } from "../SaveIndicator/CphSaveIndicator";
import { useCphAutosave } from "./useCphAutosave";

/**
 * @deprecated CphForm now generates a unique summary anchor per instance.
 * Use the rendered summary wrapper's id instead of this shared anchor.
 */
export const CPH_FORM_ERROR_ANCHOR = "cph-form-errors";

/**
 * The form instance handed to `CphForm` children.
 *
 * The validator generics are widened because `CphForm` forwards validators
 * dynamically and cannot know them at the type level. This mirrors TanStack's
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

/**
 * Adapts a raw-value validator to the shape TanStack expects.
 *
 * TanStack calls validators with a context object (`{ value, fieldApi, ... }`),
 * but the helpers in `validation/validators.ts` take the bare value. Passing one
 * straight through looks correct and silently never fails: the helper sees an
 * object where it expects a string or number and returns `undefined`.
 *
 * ```tsx
 * <form.Field name="title" validators={{ onBlur: toValidator(required("Required.")) }}>
 * ```
 */
export function toValidator<TValue>(
  validate: (value: TValue) => string | undefined,
): (ctx: { value: TValue }) => string | undefined {
  return ({ value }) => validate(value);
}

export interface CphFormAutosave<TValues> {
  /**
   * Persists the form values. Return a promise that settles after the write
   * completes: autosaves are serialized per form and pending edits coalesce to
   * the latest values. Rejecting surfaces the `"error"` save state.
   */
  onSave: (values: TValues) => void | Promise<void>;
}

export interface CphFormProps<TValues> {
  /** Seed values for the form. Also fixes the shape of every field name. */
  defaultValues: TValues;
  /** Called with the values once validation passes. */
  onSubmit: (values: TValues) => void | Promise<void>;
  /**
   * Inline validators. On submit, `schema` runs first, then `validators.onSubmit`;
   * both run even if either fails, and their form and field errors are combined.
   */
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
  /**
   * Render prop receiving the form instance. Use `form.Field` to bind inputs
   * and `form.Subscribe` to read `canSubmit` / `isSubmitting` / `isDirty`.
   */
  children: (form: CphFormApi<TValues>) => ReactNode;
  /** Submit button label. */
  submitLabel?: string;
  /** Rendered as the footer's Back affordance when provided. Unless `confirmDiscard`
   * is enabled, callers must confirm before resetting or navigating away from unsaved changes. */
  onDiscard?: () => void;
  /** Opt in to dirty-edit confirmation. `true` uses "Discard unsaved changes?";
   * a string supplies custom copy. Defaults to `false`; clean forms never prompt. */
  confirmDiscard?: CphFormActionsProps["confirmDiscard"];
  /** Hide the error summary, e.g. for inline-only forms. */
  hideErrorSummary?: boolean;
  /**
   * Maps a TanStack field name to the DOM id its error link should target.
   *
   * `CphErrorSummary` links to `#<fieldId>`, so without this the anchors are
   * dead links pointing at field names rather than real elements. Supply the
   * mapping whenever field ids differ from field names — the usual convention
   * in this package is `<name>-field`.
   */
  getFieldId?: (fieldName: string) => string;
  className?: string;
}

interface ErrorCarrier {
  form?: unknown;
  fields?: unknown;
}

function composeSubmitValidators<TValues>(
  schema: FormValidateOrFn<TValues>,
  inline: FormValidateOrFn<TValues>,
): FormValidateFn<TValues> {
  return (context) => {
    const results = [schema, inline].map((validator) =>
      typeof validator === "function"
        ? validator(context)
        : context.formApi.parseValuesWithSchema(validator),
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

function asMessage(value: unknown): string | undefined {
  if (typeof value === "string" && value !== "") return value;
  return undefined;
}

/**
 * Flattens one validator's return value into summary entries.
 *
 * A validator may return a bare string, a `FormValidationError` carrying
 * `form` and/or `fields`, or `undefined`. All three shapes reach here.
 */
function entriesFromValidatorResult(
  result: unknown,
  fieldErrors: Map<string, string>,
  errorSummaryId: string,
  getFieldId: (fieldName: string) => string,
): void {
  if (result === undefined || result === null) return;
  if (Array.isArray(result)) {
    for (const error of result) {
      entriesFromValidatorResult(error, fieldErrors, errorSummaryId, getFieldId);
    }
    return;
  }

  const bare =
    asMessage(result) ??
    (typeof result === "object" ? asMessage((result as { message?: unknown }).message) : undefined);
  if (bare !== undefined) {
    fieldErrors.set(
      errorSummaryId,
      [fieldErrors.get(errorSummaryId), bare].filter(Boolean).join(" "),
    );
    return;
  }

  const carrier =
    typeof result === "object" && Object.values(result).every(Array.isArray)
      ? { fields: result }
      : (result as ErrorCarrier);

  // Per-field errors reported by a form-level validator.
  if (carrier.fields && typeof carrier.fields === "object") {
    for (const [name, value] of Object.entries(carrier.fields)) {
      const message = asErrorMessage(value);
      if (message !== undefined) {
        const id = name === "" ? errorSummaryId : getFieldId(name);
        fieldErrors.set(id, [fieldErrors.get(id), message].filter(Boolean).join(" "));
      }
    }
  }

  // Form-level errors reported by a form-level validator.
  const formMessage = asErrorMessage(carrier.form);
  if (formMessage !== undefined) {
    fieldErrors.set(
      errorSummaryId,
      [fieldErrors.get(errorSummaryId), formMessage].filter(Boolean).join(" "),
    );
  }
}

/**
 * Collects every visible error into `CphErrorSummary` order.
 *
 * Field errors win over form errors for the same field name so the more
 * specific message is the one shown. Iteration order of `fieldMeta` follows
 * insertion, which keeps the summary stable as the user moves through fields.
 */
/**
 * Normalises one entry of a field's `errors` array.
 *
 * TanStack's types declare `ValidationError`, but a validator returning a bare
 * string stores that string directly, so both shapes must be accepted.
 */
function asErrorMessage(error: unknown): string | undefined {
  if (Array.isArray(error)) {
    const messages = [...new Set(error.map(asErrorMessage).filter(Boolean))];
    return messages.length ? messages.join(" ") : undefined;
  }
  if (typeof error === "string") return error === "" ? undefined : error;
  if (error && typeof error === "object") {
    return (
      asMessage((error as { message?: unknown }).message) ??
      asErrorMessage((error as ErrorCarrier).form)
    );
  }
  return undefined;
}

function collectErrors(
  state: {
    fieldMeta?: Record<string, { errors?: unknown[] } | undefined> | undefined;
    errorMap?: Record<string, unknown> | undefined;
  },
  getFieldId: (fieldName: string) => string,
  errorSummaryId: string,
): CphErrorSummaryEntry[] {
  const fieldErrors = new Map<string, string>();

  for (const result of Object.values(state.errorMap ?? {})) {
    entriesFromValidatorResult(result, fieldErrors, errorSummaryId, getFieldId);
  }

  for (const [name, meta] of Object.entries(state.fieldMeta ?? {})) {
    const message = asErrorMessage(meta?.errors ?? []);
    if (message !== undefined) {
      if (name === "") {
        fieldErrors.set(
          errorSummaryId,
          [...new Set([fieldErrors.get(errorSummaryId), message])].filter(Boolean).join(" "),
        );
      } else {
        fieldErrors.set(getFieldId(name), message);
      }
    }
  }

  return [...fieldErrors].map(([fieldId, message]) => ({ fieldId, message }));
}

/**
 * Form wrapper binding TanStack Form to the Colophon primitives.
 *
 * Renders the fields, an error summary, a save indicator, and the action
 * footer. Fields are supplied by the caller through a render prop so this
 * component never dictates a form's layout.
 */
export function CphForm<TValues>(props: CphFormProps<TValues>): ReactElement {
  const {
    defaultValues,
    onSubmit,
    validators,
    schema,
    autosave,
    explicitSave = false,
    children,
    submitLabel = "Save",
    onDiscard,
    confirmDiscard = false,
    hideErrorSummary = false,
    getFieldId = (fieldName) => fieldName,
    className = "",
  } = props;

  const errorSummaryId = useId();
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

  const autosaveEnabled = Boolean(autosave) && !explicitSave;
  const autosaveResult = useCphAutosave<TValues>({
    form,
    onSave: autosave?.onSave ?? (() => undefined),
    enabled: autosaveEnabled,
  });

  return (
    <form
      className={`cph-form ${className}`}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      {children(form as unknown as CphFormApi<TValues>)}

      {!hideErrorSummary && (
        <form.Subscribe selector={(state) => [state.errorMap, state.fieldMeta] as const}>
          {([errorMap, fieldMeta]) => (
            <div id={errorSummaryId} tabIndex={-1}>
              <CphErrorSummary
                errors={collectErrors({ errorMap, fieldMeta }, getFieldId, errorSummaryId)}
              />
            </div>
          )}
        </form.Subscribe>
      )}

      <CphSaveIndicator state={autosaveResult.state} errorMessage={autosaveResult.errorMessage} />

      <form.Subscribe selector={(state) => [state.isSubmitting, state.isDirty] as const}>
        {([isSubmitting, isDirty]) => (
          <CphFormActions
            isDirty={isDirty}
            isSubmitting={isSubmitting}
            onDiscard={onDiscard}
            confirmDiscard={confirmDiscard}
            submitLabel={submitLabel}
          />
        )}
      </form.Subscribe>
    </form>
  );
}
