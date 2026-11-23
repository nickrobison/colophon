import { useMemo, type ReactNode } from "react";

import { CphPdfContext, type CphPdfViewerContextValue } from "../pdf/context";
import { createMockViewer } from "./mockViewer";

export interface MockPdfProviderProps {
  /** Context fields to override; defaults describe a ready mock document. */
  value?: Partial<CphPdfViewerContextValue>;
  children?: ReactNode;
}

const noopRetry = () => {};

/** Injects a fake viewer into {@link CphPdfContext} without the real runtime. */
export function MockPdfProvider({ value, children }: MockPdfProviderProps) {
  const documents = useMemo(
    () => value?.documents ?? createMockViewer().documents,
    [value?.documents],
  );
  const contextValue = useMemo<CphPdfViewerContextValue>(
    () => ({
      documents,
      documentId: value?.documentId ?? "doc-1",
      status: value?.status ?? "ready",
      error: value?.error ?? null,
      retry: value?.retry ?? noopRetry,
    }),
    [value?.documentId, value?.status, value?.error, value?.retry, documents],
  );
  return <CphPdfContext.Provider value={contextValue}>{children}</CphPdfContext.Provider>;
}
