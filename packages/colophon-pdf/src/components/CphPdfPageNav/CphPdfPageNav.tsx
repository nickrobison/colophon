import { CphButton } from "@nickrobison/colophon";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { usePdfPageState } from "../../pdf/pageStateContext";

export interface CphPdfPageNavProps {
  className?: string;
}

/**
 * Previous/next page controls plus a live "Page N of M" indicator. Reads the
 * shared page state (see {@link usePdfPageState}), so place it anywhere inside
 * the viewer — a toolbar, a footer, or floating over the stage.
 */
export function CphPdfPageNav({ className }: CphPdfPageNavProps) {
  const { page, pageCount, goTo } = usePdfPageState();
  const noDocument = pageCount === 0;
  const atStart = noDocument || page <= 1;
  const atEnd = noDocument || page >= pageCount;

  return (
    <div
      className={["cph-pdf-page-nav", className].filter(Boolean).join(" ")}
      role="group"
      aria-label="Page navigation"
    >
      <CphButton
        variant="nav"
        isDisabled={atStart}
        onPress={() => goTo(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} aria-hidden={true} />
      </CphButton>
      <p className="cph-pdf-page-nav__indicator" role="status" aria-live="polite">
        Page <strong>{page}</strong> of {pageCount}
      </p>
      <CphButton
        variant="nav"
        isDisabled={atEnd}
        onPress={() => goTo(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight size={16} aria-hidden={true} />
      </CphButton>
    </div>
  );
}
