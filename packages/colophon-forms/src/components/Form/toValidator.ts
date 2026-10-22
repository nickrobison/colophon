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
