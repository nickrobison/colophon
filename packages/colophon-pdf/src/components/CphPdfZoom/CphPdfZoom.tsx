import { useStage } from "@embedpdf/react";
import { CphButton } from "@nickrobison/colophon";
import { Minus, Plus } from "lucide-react";
import { useCallback } from "react";

import { useCphPdfViewerPrefs } from "../../pdf/viewerPrefsContext";

export interface CphPdfZoomProps {
  /** Zoom floor (factor) that disables zoom-out; default from context (0.75). */
  minZoom?: number;
  /** Zoom ceiling (factor) that disables zoom-in; default from context (1.5). */
  maxZoom?: number;
  /**
   * Zoom step as a fraction (0.25 = 25%). Omit to use the stage's own step
   * (round levels: 100% → 125% → 150% …) via the context's `zoomIn`/`zoomOut`.
   * A custom step zooms additively through `stage.zoomBy` so it is honored
   * exactly (e.g. min 100 max 200 step 50 → 100% → 150% → 200%).
   */
  step?: number;
  className?: string;
}

/**
 * Zoom out / zoom level / zoom in. The level readout normalizes the stage's
 * zoom factor to a percentage and announces changes via `aria-live`; the
 * buttons are disabled at the configured bounds.
 */
export function CphPdfZoom({ minZoom, maxZoom, step, className }: CphPdfZoomProps) {
  const {
    zoom,
    zoomIn,
    zoomOut,
    minZoom: contextMin,
    maxZoom: contextMax,
  } = useCphPdfViewerPrefs();
  const stage = useStage();

  const lo = minZoom ?? contextMin;
  const hi = maxZoom ?? contextMax;
  const canZoomOut = zoom > lo;
  const canZoomIn = zoom < hi;
  const percent = Math.round(zoom * 100);

  // Additive stepping for a custom step: from `zoom`, a click lands on
  // `zoom ± step` exactly (zoomBy multiplies, so the factor is the ratio).
  const zoomByStep = useCallback(
    (direction: 1 | -1) => {
      if (step === undefined) {
        if (direction === 1) zoomIn();
        else zoomOut();
        return;
      }
      const next = Math.max(0.05, zoom + direction * step);
      stage.zoomBy(next / zoom);
    },
    [step, zoom, zoomIn, zoomOut, stage],
  );

  return (
    <div
      className={["cph-pdf-zoom", className].filter(Boolean).join(" ")}
      role="group"
      aria-label="Zoom"
    >
      <CphButton
        variant="nav"
        aria-label="Zoom out"
        isDisabled={!canZoomOut}
        onPress={() => zoomByStep(-1)}
      >
        <Minus size={16} aria-hidden={true} />
      </CphButton>
      <span className="cph-pdf-zoom__level" role="status" aria-live="polite">
        {percent}%
      </span>
      <CphButton
        variant="nav"
        aria-label="Zoom in"
        isDisabled={!canZoomIn}
        onPress={() => zoomByStep(1)}
      >
        <Plus size={16} aria-hidden={true} />
      </CphButton>
    </div>
  );
}
