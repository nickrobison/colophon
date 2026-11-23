import { createContext, useContext } from "react";

/** The shared page indicator: 1-based `page` and `pageCount`, plus navigation. */
export interface CphPdfPageState {
  /** Current page, 1-based. `0` while there is no document. */
  page: number;
  /** Total pages. `0` while there is no document. */
  pageCount: number;
  /** Jump to a page. Clamped to `[1, pageCount]`; no-op without a document. */
  goTo: (next: number) => void;
  /** Alias of {@link CphPdfPageState.goTo}: imperatively set the current page. */
  setPage: (page: number) => void;
}

export const CphPdfPageStateContext = createContext<CphPdfPageState | null>(null);

/**
 * Reads the shared page state provided around the stage. Throws when called
 * outside a {@link CphPdfViewer} (which always installs the provider) or a
 * standalone {@link CphPdfPageStateProvider}.
 */
export function usePdfPageState(): CphPdfPageState {
  const value = useContext(CphPdfPageStateContext);
  if (value === null) {
    throw new Error(
      "usePdfPageState must be used inside <CphPdfViewer> or <CphPdfPageStateProvider>.",
    );
  }
  return value;
}
