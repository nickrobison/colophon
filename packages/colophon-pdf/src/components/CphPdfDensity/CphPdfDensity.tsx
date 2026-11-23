import { CphSelect, type CphSelectOption } from "@nickrobison/colophon-forms";

import { useCphPdfViewerPrefs, type CphPdfDensityPreset } from "../../pdf/viewerPrefsContext";

export interface CphPdfDensityProps {
  className?: string;
}

const DENSITY_OPTIONS: readonly CphSelectOption[] = [
  { value: "comfortable", label: "Comfortable" },
  { value: "compact", label: "Compact" },
  { value: "dense", label: "Dense" },
];

/**
 * Comfortable/compact/dense selector. Uses colophon-forms' `CphSelect`
 * (consistency over a bespoke native select) and writes the choice to the
 * viewer shell via `data-density`, which colophon's tokens respond to.
 */
export function CphPdfDensity({ className }: CphPdfDensityProps) {
  const { density, setDensity } = useCphPdfViewerPrefs();

  return (
    <div
      className={["cph-pdf-density", className].filter(Boolean).join(" ")}
      role="group"
      aria-label="Density"
    >
      <CphSelect
        label="Density"
        options={DENSITY_OPTIONS}
        selectedKey={density}
        onSelectionChange={(key) => setDensity(key as CphPdfDensityPreset)}
      />
    </div>
  );
}
