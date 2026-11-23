import type { DocumentsCapability } from "@embedpdf/react";
import { createContext, useContext } from "react";

/** Lifecycle of the document the viewer is opening. */
export type CphPdfViewerStatus = "loading" | "ready" | "error";

/** What {@link usePdfViewer} exposes to components rendered inside a viewer. */
export interface CphPdfViewerContextValue {
  /** EmbedPDF's document registry: open, close, retry, download, page queries. */
  documents: DocumentsCapability;
  /** The open document's id once ready; `null` while loading or after a failure. */
  documentId: string | null;
  status: CphPdfViewerStatus;
  /** The failure that put the viewer in `status: "error"`. */
  error: Error | null;
  /** Re-open the document after a failure. */
  retry: () => void;
}

export const CphPdfContext = createContext<CphPdfViewerContextValue | null>(null);

/**
 * Reads the surrounding {@link CphPdfViewer} state. Throws when called outside a
 * viewer, so misuse fails loudly instead of rendering a silently dead toolbar.
 */
export function usePdfViewer(): CphPdfViewerContextValue {
  const value = useContext(CphPdfContext);
  if (!value) {
    throw new Error("usePdfViewer must be used inside <CphPdfViewer>.");
  }
  return value;
}
