import { createContext, useContext } from "react";

/** The v1 annotation tools (behavior itself lands in plans 08–09). */
export type CphPdfTool = "read" | "highlight" | "comment";
/** Density presets; the values colophon's tokens respond to via `data-density`. */
export type CphPdfDensityPreset = "comfortable" | "compact" | "dense";
export type CphPdfTheme = "light" | "dark";

/**
 * The single source of the v1 tool → interaction-plugin tool-id mapping. `read`
 * maps to the interaction plugin's built-in `pointer` tool (text selection +
 * link navigation). `highlight`/`comment` are placeholder ids registered by
 * `CphPdfViewerPrefsProvider` so the switcher works before plans 08–09 add
 * real tool behavior — they carry no pointer handlers yet.
 */
export const TOOL_IDS: Record<CphPdfTool, string> = {
  read: "pointer",
  highlight: "highlight",
  comment: "comment",
};

/** Reverse mapping (derived, so tool ids live in exactly one place). */
export const TOOL_BY_ID: Record<string, CphPdfTool> = (
  Object.keys(TOOL_IDS) as CphPdfTool[]
).reduce(
  (acc, tool) => {
    acc[TOOL_IDS[tool]] = tool;
    return acc;
  },
  {} as Record<string, CphPdfTool>,
);

/** The shared toolbar state slice provided by {@link CphPdfViewerPrefsProvider}. */
export interface CphPdfViewerPrefs {
  /** Active v1 tool, or `null` while a non-v1 tool (e.g. the zoom box) is active. */
  tool: CphPdfTool | null;
  setTool: (tool: CphPdfTool) => void;
  /** Current zoom as a factor (1 = 100%). */
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
  /** Zoom bounds (factors) used for the can-zoom flags. */
  minZoom: number;
  maxZoom: number;
  density: CphPdfDensityPreset;
  setDensity: (density: CphPdfDensityPreset) => void;
  theme: CphPdfTheme;
  toggleTheme: () => void;
}

export const CphPdfViewerPrefsContext = createContext<CphPdfViewerPrefs | null>(null);

/**
 * Reads the shared toolbar state. Throws when called outside a
 * {@link CphPdfViewer} (which always installs the provider when ready).
 */
export function useCphPdfViewerPrefs(): CphPdfViewerPrefs {
  const value = useContext(CphPdfViewerPrefsContext);
  if (value === null) {
    throw new Error("useCphPdfViewerPrefs must be used inside <CphPdfViewer>.");
  }
  return value;
}
