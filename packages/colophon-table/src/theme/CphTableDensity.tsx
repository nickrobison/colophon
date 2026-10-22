import type { CphDensity } from "@nickrobison/colophon";
import { useContext, type ReactNode } from "react";

import { CphTableDensityContext, resolveCphTableDensity } from "./cphTableDensityContext";

/**
 * Table density provider. A provider without an explicit `density` resolves
 * to the compact spec default — core provider density is deliberately NOT
 * inherited, so tables stay dense even inside comfortable layouts. Nested
 * table providers inherit from the nearest table provider ancestor.
 */
export function CphTableDensityProvider({
  children,
  density,
}: {
  children: ReactNode;
  density?: CphDensity | undefined;
}) {
  const parent = useContext(CphTableDensityContext);
  const resolved = resolveCphTableDensity(density, parent);
  return (
    <CphTableDensityContext.Provider value={resolved}>{children}</CphTableDensityContext.Provider>
  );
}
