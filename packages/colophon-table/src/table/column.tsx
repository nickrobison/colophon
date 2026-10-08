import { createColumnHelper, type CellData, type ColumnDef, type RowData } from "@tanstack/react-table";

import type { CphTableFeatures } from "./features";
import type { CphStatusTone } from "../components/StatusChip/CphStatusChip";

/**
 * Per-column presentation config, carried on TanStack's `meta` bag so the table
 * primitives stay generic and know nothing about any specific dataset.
 */
export interface CphColumnMeta {
  numeric?: boolean | undefined;
  align?: "left" | "right" | undefined;
  aggregate?: "sum" | "mean" | "count" | undefined;
  format?: ((value: unknown) => string) | undefined;
  widthClass?: string | undefined;
  statusTone?: ((value: unknown) => CphStatusTone) | undefined;
}

type WithMeta = { meta?: CphColumnMeta };

/** Creates a column def bound to `TData` with {@link CphColumnMeta} typing. */
export function cphColumnHelper<TData extends RowData>() {
  return createColumnHelper<CphTableFeatures, TData>();
}

/** Reads `meta` off a column def without the generic noise at call sites. */
export function metaOf<TData extends RowData, TValue extends CellData = CellData>(
  def: ColumnDef<CphTableFeatures, TData, TValue>,
): CphColumnMeta {
  return (def as WithMeta).meta ?? {};
}
