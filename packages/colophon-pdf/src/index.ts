// @nickrobison/colophon-pdf — public surface.

export { CphPdfViewer, type CphPdfViewerProps } from "./components/CphPdfViewer/CphPdfViewer";
export {
  CphPdfContext,
  usePdfViewer,
  type CphPdfViewerContextValue,
  type CphPdfViewerStatus,
} from "./pdf/context";
export { createCphPdfEngine, type CphPdfEngineConfig } from "./pdf/engine";
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
} from "@embedpdf/react";
