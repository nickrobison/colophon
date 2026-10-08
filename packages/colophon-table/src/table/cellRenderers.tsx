import type { ReactElement } from "react";

import { CphStatusChip, type CphStatusTone } from "../components/StatusChip/CphStatusChip";

/**
 * Cell renderer return type.
 *
 * These renderers are simplified value formatters — they take a raw `value`
 * and return renderable content (string or ReactElement). They do NOT receive
 * a TanStack `CellContext`; the table body component is responsible for
 * extracting the value and passing it to the renderer.
 *
 * Composition with {@link Cell} (the `<td>`-rendering component):
 * - The table body component renders `<Cell className={tdClassName}>{renderer(value)}</Cell>`
 * - For numeric columns, the table body should pass `tdClassName="cph-table__numeric"`
 *   by reading `column.columnDef.meta.numeric`. This ensures `text-align: right`
 *   applies to the `<td>` itself (block-level), which is required for alignment.
 * - The renderer ALSO wraps its output in a block element with the same class
 *   as a defense-in-depth measure: if the table body omits the td className,
 *   the content wrapper still gets `text-align: right` and `font-variant-numeric`.
 * - `createTruncateCell` returns an inline `<span>` because truncation relies on
 *   `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` which works
 *   on inline-block/block containers; the `<td>` already provides the container.
 */
export type CellRenderer = (value: unknown) => string | ReactElement;

/**
 * Creates a sort header label renderer.
 *
 * Renders the LABEL ONLY. The interactive sort button and arrow belong to the
 * `HeaderCell` component, which another agent owns. Do not add a `<button>`
 * or an arrow here.
 */
export function createSortHeader(label: string): () => ReactElement {
  return () => <span className="cph-table__sort-label">{label}</span>;
}

/**
 * Creates a numeric cell renderer.
 *
 * Applies `cph-table__numeric` (which carries `text-align: right` and
 * `font-variant-numeric: tabular-nums` in CSS) to a block-level wrapper.
 * Formats via `toLocaleString` by default.
 *
 * The wrapper is a `<div>` (block-level) so `text-align: right` takes effect.
 * The table body component SHOULD also apply `cph-table__numeric` to the `<td>`
 * via `Cell`'s `className` prop for robust alignment.
 */
export function createNumericCell(
  format?: (value: unknown) => string,
): CellRenderer {
  return (value: unknown) => {
    const formatted = format
      ? format(value)
      : typeof value === "number"
        ? value.toLocaleString("en-US")
        : String(value ?? "");
    return (
      <div className="cph-table__numeric" data-cph-table="numeric-cell">
        {formatted}
      </div>
    );
  };
}

/**
 * Creates a status cell renderer.
 *
 * Renders a {@link CphStatusChip} with the given tone.
 */
export function createStatusCell(
  tone: CphStatusTone,
): CellRenderer {
  return (value: unknown) => (
    <CphStatusChip tone={tone}>{String(value ?? "")}</CphStatusChip>
  );
}

/**
 * Creates a truncating cell renderer.
 *
 * Ellipsis-truncates long text. The `title` attribute keeps the full value
 * reachable on hover, which the expansion panel also exposes.
 */
export function createTruncateCell(): CellRenderer {
  return (value: unknown) => {
    const text = String(value ?? "");
    return (
      <span className="cph-table__truncate" title={text} data-cph-table="truncate-cell">
        {text}
      </span>
    );
  };
}