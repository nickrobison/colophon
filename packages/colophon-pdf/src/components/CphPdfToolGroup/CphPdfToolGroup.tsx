import { ToggleButton, ToggleButtonGroup, type Selection } from "react-aria-components";

import { useCphPdfViewerPrefs, type CphPdfTool } from "../../pdf/viewerPrefsContext";

export interface CphPdfToolGroupProps {
  /**
   * Controlled active tool; omit for the context default (the interaction
   * plugin's active tool). `null` selects nothing.
   */
  tool?: CphPdfTool | null;
  /** Controlled: fired when the user activates a tool. */
  onToolChange?: (tool: CphPdfTool) => void;
  /** Override the button labels (defaults: Read / Highlight / Comment). */
  labels?: Partial<Record<CphPdfTool, string>>;
  className?: string;
}

const DEFAULT_LABELS: Record<CphPdfTool, string> = {
  read: "Read",
  highlight: "Highlight",
  comment: "Comment",
};

/**
 * Single-select read/highlight/comment switcher. Drives the interaction
 * plugin's active tool; arrow keys move the selection and Enter/Space
 * activates — both come from RAC's `ToggleButtonGroup`. With
 * `selectionMode="single"` RAC renders a radiogroup of radios (`aria-checked`,
 * `[data-selected]`), the ARIA pattern for mutually-exclusive single selection
 * — not `aria-pressed` toggle buttons — so the CSS targets `[aria-checked]`.
 * Tool behavior itself (highlighting, commenting) lands in plans 08–09; this
 * delivers the switching mechanism only.
 */
export function CphPdfToolGroup({ tool, onToolChange, labels, className }: CphPdfToolGroupProps) {
  const { tool: contextTool, setTool } = useCphPdfViewerPrefs();
  const effectiveTool = tool !== undefined ? tool : contextTool;

  const handleSelection = (keys: Selection) => {
    const next = [...keys][0] as CphPdfTool | undefined;
    if (next !== undefined && next in DEFAULT_LABELS) {
      setTool(next);
      onToolChange?.(next);
    }
  };

  return (
    <ToggleButtonGroup
      aria-label="Tools"
      orientation="horizontal"
      selectionMode="single"
      selectedKeys={effectiveTool === null ? [] : [effectiveTool]}
      onSelectionChange={handleSelection}
      className={["cph-pdf-tool-group", className].filter(Boolean).join(" ")}
    >
      {(Object.keys(DEFAULT_LABELS) as CphPdfTool[]).map((value) => (
        <ToggleButton key={value} id={value} className="cph-pdf-tool-group__tool">
          {labels?.[value] ?? DEFAULT_LABELS[value]}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
