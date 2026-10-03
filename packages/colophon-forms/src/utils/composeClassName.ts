import type { ClassNameOrFunction } from "react-aria-components";

/**
 * Composes a base class name with an incoming `className` value that may be
 * a plain string, a React Aria render-props callback, or `undefined`.
 *
 * React Aria components accept `className` as either a string or a function
 * `(renderProps) => string`. When a function is interpolated into a template
 * literal it is stringified to its source text (e.g. `"cph-field function(){…}"`),
 * which is the bug this helper prevents.
 *
 * - `undefined` → returns the base class unchanged.
 * - string → returns `"base incoming"`.
 * - function → returns a new function that calls the incoming callback with the
 *   render props and prepends the base class to the result.
 */
export function composeClassName<T>(
  base: string,
  incoming: ClassNameOrFunction<T> | undefined,
): ClassNameOrFunction<T> {
  if (incoming === undefined) {
    return base;
  }
  if (typeof incoming === "string") {
    return `${base} ${incoming}`;
  }
  return (values: T & { defaultClassName: string | undefined }) =>
    `${base} ${incoming(values)}`;
}
