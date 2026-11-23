// @nickrobison/colophon-pdf — public surface.

export { CphPdfViewer, type CphPdfViewerProps } from "./components/CphPdfViewer/CphPdfViewer";
export { CphPdfPageNav, type CphPdfPageNavProps } from "./components/CphPdfPageNav/CphPdfPageNav";
export { CphPdfStage, type CphPdfStageProps } from "./components/CphPdfStage/CphPdfStage";
export {
  CphPdfToolGroup,
  type CphPdfToolGroupProps,
} from "./components/CphPdfToolGroup/CphPdfToolGroup";
export { CphPdfZoom, type CphPdfZoomProps } from "./components/CphPdfZoom/CphPdfZoom";
export { CphPdfDensity, type CphPdfDensityProps } from "./components/CphPdfDensity/CphPdfDensity";
export {
  CphPdfThemeToggle,
  type CphPdfThemeToggleProps,
} from "./components/CphPdfThemeToggle/CphPdfThemeToggle";
export {
  CphPdfContext,
  usePdfViewer,
  type CphPdfViewerContextValue,
  type CphPdfViewerStatus,
} from "./pdf/context";
export { createCphPdfEngine, type CphPdfEngineConfig } from "./pdf/engine";
export {
  CphPdfPageStateContext,
  usePdfPageState,
  type CphPdfPageState,
} from "./pdf/pageStateContext";
export { CphPdfPageStateProvider, type CphPdfPageStateProviderProps } from "./pdf/pageState";
export {
  CphPdfViewerPrefsContext,
  useCphPdfViewerPrefs,
  type CphPdfDensityPreset,
  type CphPdfTheme,
  type CphPdfTool,
  type CphPdfViewerPrefs,
} from "./pdf/viewerPrefsContext";
export { CphPdfViewerPrefsProvider, type CphPdfViewerPrefsProviderProps } from "./pdf/viewerPrefs";
export { toCphPdfOpenSource, type CphPdfDocumentSource } from "./pdf/source";

// EmbedPDF headless hooks, re-exported so consumers never import the engine
// package directly. These must be used inside <CphPdfViewer>.
export {
  useAnnotation,
  useAnnotationState,
  useCommentThreads,
  useComments,
  useDocument,
  useDocuments,
  useDocumentsState,
  useInteraction,
  useOutline,
  useOutlineState,
  usePageList,
  useRender,
  useSearch,
  useSearchHits,
  useSearchState,
  useSelection,
  useStage,
  useStageState,
} from "@embedpdf/react";

export type {
  AnyPlugin,
  DocumentInfo,
  DocumentsCapability,
  Engine,
  EngineFactory,
  OpenSource,
  PageContextValue,
} from "@embedpdf/react";
