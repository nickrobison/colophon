import {
  useForm,
  type FormValidateOrFn,
  type FormAsyncValidateOrFn,
  type ReactFormExtendedApi,
} from "@tanstack/react-form";
import { useId, type ReactElement, type ReactNode } from "react";

import { CphErrorSummary, type CphErrorSummaryEntry } from "../ErrorSummary/CphErrorSummary";
import { CphFormActions } from "../FormActions/CphFormActions";
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
  /** Persists the form values. Rejecting surfaces the `"error"` save state. */
  onSave: (values: TValues) => void | Promise<void>;
}

export interface CphFormProps<TValues> {
  /** Seed values for the form. Also fixes the shape of every field name. */
  defaultValues: TValues;
  /** Called with the values once validation passes. */
  onSubmit: (values: TValues) => void | Promise<void>;
  /**
   * Inline validators. Combine freely with `schema` — TanStack runs every
   * registered validator for a cause, so the first failure wins.
   */
  validators?: CphFormValidators<TValues>;
  /**
   * Optional Standard Schema (e.g. a Zod schema) applied on submit.
   *
   * Passed straight through to TanStack, which understands Standard Schema
   * natively. This is the "Zod" half of the project's Zod-plus-inline decision.
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
  /** Rendered as the footer's Back affordance when provided. */
  onDiscard?: () => void;
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
): void {
  if (result === undefined || result === null) return;

  const bare = asMessage(result);
  if (bare !== undefined) {
    fieldErrors.set(errorSummaryId, bare);
    return;
  }

  const carrier = result as ErrorCarrier;

  // Per-field errors reported by a form-level validator.
  if (carrier.fields && typeof carrier.fields === "object") {
    for (const [name, value] of Object.entries(carrier.fields)) {
      const message = asMessage(value) ?? asMessage((value as ErrorCarrier | undefined)?.form);
      if (message !== undefined) fieldErrors.set(name, message);
    }
  }

  // Form-level errors reported by a form-level validator.
  const formMessage =
    asMessage(carrier.form) ?? asMessage((carrier.form as ErrorCarrier | undefined)?.form);
  if (formMessage !== undefined) fieldErrors.set(errorSummaryId, formMessage);
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
  if (typeof error === "string") return error === "" ? undefined : error;
  if (error && typeof error === "object") {
    return asMessage((error as { message?: unknown }).message);
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
    entriesFromValidatorResult(result, fieldErrors, errorSummaryId);
  }

  for (const [name, meta] of Object.entries(state.fieldMeta ?? {})) {
    for (const error of meta?.errors ?? []) {
      const message = asErrorMessage(error);
      if (message !== undefined) fieldErrors.set(getFieldId(name), message);
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
    hideErrorSummary = false,
    getFieldId = (fieldName) => fieldName,
    className = "",
  } = props;

  const errorSummaryId = useId();
  const form = useForm({
    defaultValues,
    validators: {
      ...validators,
      ...(schema ? { onSubmit: schema } : {}),
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
            submitLabel={submitLabel}
          />
        )}
      </form.Subscribe>
    </form>
  );
}
