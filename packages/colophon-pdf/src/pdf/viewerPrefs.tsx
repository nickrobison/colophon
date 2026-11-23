import {
  useInteraction,
  useInteractionState,
  useStage,
  useStageState,
  type Tool,
} from "@embedpdf/react";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  CphPdfViewerPrefsContext,
  TOOL_BY_ID,
  TOOL_IDS,
  type CphPdfDensityPreset,
  type CphPdfTheme,
  type CphPdfTool,
  type CphPdfViewerPrefs,
} from "./viewerPrefsContext";

export interface CphPdfViewerPrefsProviderProps {
  /**
   * Controlled density. While set, the shell's `data-density` follows this
   * value; pair with {@link CphPdfViewerPrefsProviderProps.onDensityChange}.
   * Omit for the uncontrolled default (`"comfortable"`).
   */
  density?: CphPdfDensityPreset;
  /** Controlled: fired with the new density when the user changes it. */
  onDensityChange?: (density: CphPdfDensityPreset) => void;
  /**
   * Controlled theme. While set, the shell's `data-theme` follows this value;
   * pair with {@link CphPdfViewerPrefsProviderProps.onThemeChange}. Omit for
   * the uncontrolled default (`"light"`).
   */
  theme?: CphPdfTheme;
  /** Controlled: fired with the new theme when the user toggles it. */
  onThemeChange?: (theme: CphPdfTheme) => void;
  /** Zoom floor (factor) below which zoom-out is disabled. Default `0.75`. */
  minZoom?: number;
  /** Zoom ceiling (factor) at which zoom-in is disabled. Default `1.5`. */
  maxZoom?: number;
  children?: ReactNode;
}

export const DEFAULT_MIN_ZOOM = 0.75;
export const DEFAULT_MAX_ZOOM = 1.5;

// v1 placeholder tools. Plans 08–09 register real highlight/comment tools with
// pointer behavior; until then these only make the tool switcher's
// activateTool() calls resolve (an unregistered id throws not-found). They
// carry no pointer handlers, so selecting them just changes the active tool.
const PLACEHOLDER_TOOLS: readonly Tool[] = [
  { id: "highlight", cursor: "crosshair" },
  { id: "comment", cursor: "pointer" },
];

/**
 * Shares the toolbar state (tool, zoom, density, theme) with everything under
 * the document scope and applies `data-density`/`data-theme` to the viewer
 * shell — colophon's tokens respond to those attributes directly. Mounted by
 * `CphPdfViewer` inside the `DocumentScope`, so the stage and interaction
 * capabilities always resolve.
 */
export function CphPdfViewerPrefsProvider({
  density,
  onDensityChange,
  theme,
  onThemeChange,
  minZoom = DEFAULT_MIN_ZOOM,
  maxZoom = DEFAULT_MAX_ZOOM,
  children,
}: CphPdfViewerPrefsProviderProps) {
  const stage = useStage();
  const interaction = useInteraction();
  const zoomLevel = useStageState((state) => state.zoomLevel);
  const activeToolId = useInteractionState((state) => state.activeToolId);

  // Density/theme are pure UI prefs — no document needed. The stage stays the
  // source of truth for zoom, and the interaction plugin for the active tool.
  const [internalDensity, setInternalDensity] = useState<CphPdfDensityPreset>("comfortable");
  const [internalTheme, setInternalTheme] = useState<CphPdfTheme>("light");
  const effectiveDensity = density ?? internalDensity;
  const effectiveTheme = theme ?? internalTheme;

  const setDensity = useCallback(
    (next: CphPdfDensityPreset) => {
      if (density === undefined) setInternalDensity(next);
      onDensityChange?.(next);
    },
    [density, onDensityChange],
  );

  const toggleTheme = useCallback(() => {
    const next: CphPdfTheme = effectiveTheme === "light" ? "dark" : "light";
    if (theme === undefined) setInternalTheme(next);
    onThemeChange?.(next);
  }, [effectiveTheme, theme, onThemeChange]);

  // Register the placeholder tools once per interaction capability (guarded by
  // hasTool so re-runs and later plans registering real tools are no-ops).
  useEffect(() => {
    const unsubscribers = PLACEHOLDER_TOOLS.filter((tool) => !interaction.hasTool(tool.id)).map(
      (tool) => interaction.registerTool(tool),
    );
    return () => {
      for (const unsubscribe of unsubscribers) unsubscribe();
    };
  }, [interaction]);

  const tool: CphPdfTool | null = activeToolId ? (TOOL_BY_ID[activeToolId] ?? null) : null;
  const setTool = useCallback(
    (next: CphPdfTool) => {
      const id = TOOL_IDS[next];
      if (interaction.getActiveToolId() !== id) interaction.activateTool(id);
    },
    [interaction],
  );

  // getZoomLevel() returns a factor (1 = 100%); components normalize for display.
  const zoomIn = useCallback(() => stage.zoomIn(), [stage]);
  const zoomOut = useCallback(() => stage.zoomOut(), [stage]);
  const canZoomIn = zoomLevel < maxZoom;
  const canZoomOut = zoomLevel > minZoom;

  const value = useMemo<CphPdfViewerPrefs>(
    () => ({
      tool,
      setTool,
      zoom: zoomLevel,
      zoomIn,
      zoomOut,
      canZoomIn,
      canZoomOut,
      minZoom,
      maxZoom,
      density: effectiveDensity,
      setDensity,
      theme: effectiveTheme,
      toggleTheme,
    }),
    [
      tool,
      setTool,
      zoomLevel,
      zoomIn,
      zoomOut,
      canZoomIn,
      canZoomOut,
      minZoom,
      maxZoom,
      effectiveDensity,
      setDensity,
      effectiveTheme,
      toggleTheme,
    ],
  );

  return (
    <CphPdfViewerPrefsContext.Provider value={value}>
      <div
        className="cph-pdf-viewer__shell"
        data-density={effectiveDensity}
        data-theme={effectiveTheme}
      >
        {children}
      </div>
    </CphPdfViewerPrefsContext.Provider>
  );
}
