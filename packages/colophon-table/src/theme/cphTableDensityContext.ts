import type { CphDensity } from "@nickrobison/colophon";
import { createContext, useContext } from "react";

/**
 * Resolves the effective table density.
 *
 * The fallback is "compact" — not the core provider's "comfortable" default —
 * because the Confluence Tables Spec makes Compact the default density for
 * tables. That mismatch is deliberate: tables are dense, comparison-focused
 * ledgers, so they should not inherit the comfortable spacing used by form
 * fields and cards.
 */
export function resolveCphTableDensity(
  explicit?: CphDensity,
  contextDensity?: CphDensity,
): CphDensity {
  return explicit ?? contextDensity ?? "compact";
}

export const CphTableDensityContext = createContext<CphDensity | undefined>(undefined);

export function useCphTableDensity(): CphDensity {
  return useContext(CphTableDensityContext) ?? "compact";
}
