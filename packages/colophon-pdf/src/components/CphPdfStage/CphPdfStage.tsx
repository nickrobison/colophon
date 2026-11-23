import { RenderLayer, Stage, useStage, type PageContextValue } from "@embedpdf/react";
import { useEffect, type CSSProperties, type ReactNode } from "react";

export interface CphPdfStageProps {
  /**
   * One page at a time (`"single"`, the default, mapped to the stage's `paged`
   * flow) or the whole document in one continuous scroll (`"continuous"`).
   */
  layoutMode?: "single" | "continuous";
  /**
   * Optional per-page layer slots rendered in page space (they rotate with the
   * page's display rotation; coordinates are PDF points). Receives each
   * visible page's context; the rendered page itself is always mounted first,
   * so a layer can draw selection/annotation UI over it. Omit for the bare
   * rendered page.
   */
  children?: (page: PageContextValue) => ReactNode;
  className?: string;
  /** Sizing for the stage viewport — give it a height (e.g. `{ height: 600 }`). */
  style?: CSSProperties;
}

const FLOW_BY_LAYOUT: Record<
  NonNullable<CphPdfStageProps["layoutMode"]>,
  "paged" | "continuous"
> = {
  single: "paged",
  continuous: "continuous",
};

/**
 * The page canvas: EmbedPDF's `Stage` (scrolling, zoom-aware, virtualized by the
 * render plugin) with a `RenderLayer` that paints each page at every zoom.
 * Dimensions come from the consumer (`style`), matching the Kepler layout.
 */
export function CphPdfStage({
  layoutMode = "single",
  children,
  className,
  style,
}: CphPdfStageProps) {
  const stage = useStage();
  const flow = FLOW_BY_LAYOUT[layoutMode];

  // The stage owns its flow; patch only when the requested mode differs.
  useEffect(() => {
    if (stage.getSettings().flow !== flow) stage.updateSettings({ flow });
  }, [flow, stage]);

  return (
    <Stage
      className={["cph-pdf-stage", className].filter(Boolean).join(" ")}
      {...(style === undefined ? {} : { style })}
    >
      {(page) => (
        <>
          <RenderLayer />
          {children?.(page)}
        </>
      )}
    </Stage>
  );
}
