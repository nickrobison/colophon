import { useStage, useStageState } from "@embedpdf/react";
import { useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";

import { CphPdfPageStateContext, type CphPdfPageState } from "./pageStateContext";

export interface CphPdfPageStateProviderProps {
  /**
   * Controlled current page (1-based). While set, the displayed page follows
   * this value; pair with {@link CphPdfPageStateProviderProps.onPageChange}.
   * Omit for the uncontrolled default, where the stage's scrolling owns the
   * page.
   */
  page?: number;
  /**
   * Controlled: called with the new page whenever the stage's page changes
   * (scroll, wheel, or a programmatic `goTo`). Ignored in controlled mode if
   * the owner already passed the same value, so it never loops.
   */
  onPageChange?: (page: number) => void;
  children?: ReactNode;
}

function clampPage(page: number, pageCount: number): number {
  return Math.min(Math.max(Math.round(page), 1), pageCount);
}

function resolveEffectivePage(
  page: number | undefined,
  mirrorPage: number,
  pageCount: number,
): number {
  // Uncontrolled: the stage's mirror (0 while there is no document).
  if (page === undefined) return mirrorPage;
  // Controlled: also 0 while there is no document.
  if (pageCount === 0) return 0;
  return clampPage(page, pageCount);
}

/**
 * Mirrors the stage's page into shared context (the stage stays the source of
 * truth) and exposes clamped navigation. Mounted by `CphPdfViewer` under a
 * `DocumentScope`, so the stage capability always resolves.
 */
export function CphPdfPageStateProvider({
  page,
  onPageChange,
  children,
}: CphPdfPageStateProviderProps) {
  const stage = useStage();
  const currentPageIndex = useStageState((state) => state.currentPageIndex);
  const pageCount = useStageState((state) => state.pageCount);

  const mirrorPage = pageCount > 0 ? currentPageIndex + 1 : 0;
  const effectivePage = resolveEffectivePage(page, mirrorPage, pageCount);

  // Latest callback without re-running the notification effect when it changes.
  const callbacks = useRef({ onPageChange });
  useEffect(() => {
    callbacks.current = { onPageChange };
  });

  // Controlled mode: notify the owner only on real page changes (never on the
  // initial sync), so the stage's scrolling reports back without any loop.
  const lastNotified = useRef<number | null>(null);
  const initialised = useRef(false);
  useEffect(() => {
    if (pageCount === 0) {
      initialised.current = false;
      return;
    }
    const current = currentPageIndex + 1;
    if (!initialised.current) {
      initialised.current = true;
      lastNotified.current = current;
      return;
    }
    if (lastNotified.current === current) return;
    lastNotified.current = current;
    callbacks.current.onPageChange?.(current);
  }, [currentPageIndex, pageCount]);

  const goTo = useCallback(
    (next: number) => {
      if (pageCount === 0) return;
      stage.goToPage(clampPage(next, pageCount) - 1);
    },
    [pageCount, stage],
  );

  // Controlled mode: keep the stage in step with the requested page. Every
  // other path writes through the stage (`goTo`, the nav buttons), so this
  // only moves the camera when the owner demands a page the stage isn't
  // already on — including an initial `page` prop that jumps the viewer on
  // mount. Skipped entirely in uncontrolled mode.
  useEffect(() => {
    if (page === undefined || pageCount === 0) return;
    const target = clampPage(page, pageCount) - 1;
    if (stage.getCurrentPageIndex() !== target) stage.goToPage(target);
  }, [page, pageCount, stage]);

  const value = useMemo<CphPdfPageState>(
    () => ({ page: effectivePage, pageCount, goTo, setPage: goTo }),
    [effectivePage, pageCount, goTo],
  );

  return (
    <CphPdfPageStateContext.Provider value={value}>{children}</CphPdfPageStateContext.Provider>
  );
}
