import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import fixtureUrl from "../fixtures/basic.pdf?url";
import {
  CphPdfDensity,
  CphPdfPageNav,
  CphPdfStage,
  CphPdfThemeToggle,
  CphPdfToolGroup,
  CphPdfViewer,
  CphPdfZoom,
  type CphPdfTool,
} from "../src";

interface ToolbarProps {
  minZoom?: number;
  maxZoom?: number;
  step?: number;
  tool?: CphPdfTool | null;
  onToolChange?: (tool: CphPdfTool) => void;
}

/** The Kepler toolbar cluster composed inside a real viewer. No `play` — the
 * planned e2e specs target these exact stories. */
function Toolbar({ minZoom, maxZoom, step, tool, onToolChange }: ToolbarProps) {
  return (
    <div className="cph-pdf-toolbar" role="toolbar" aria-label="Document tools">
      <CphPdfToolGroup
        {...(tool === undefined ? {} : { tool })}
        {...(onToolChange === undefined ? {} : { onToolChange })}
      />
      <CphPdfZoom
        {...(minZoom === undefined ? {} : { minZoom })}
        {...(maxZoom === undefined ? {} : { maxZoom })}
        {...(step === undefined ? {} : { step })}
      />
      <CphPdfDensity />
      <CphPdfThemeToggle />
    </div>
  );
}

interface DocumentStudioProps extends ToolbarProps {
  /** Continuous scroll vs one page at a time. */
  layoutMode?: "single" | "continuous";
}

function DocumentStudio({ layoutMode = "single", ...toolbarProps }: DocumentStudioProps) {
  return (
    <CphPdfViewer source={fixtureUrl}>
      <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "1rem",
            flexWrap: "wrap",
            padding: "0.5rem 1rem",
            borderBottom: "1px solid var(--cph-line)",
          }}
        >
          <CphPdfPageNav />
          <Toolbar {...toolbarProps} />
        </div>
        <CphPdfStage layoutMode={layoutMode} style={{ flex: 1, minHeight: 0 }} />
      </div>
    </CphPdfViewer>
  );
}

function ControlledToolbar() {
  const [tool, setTool] = useState<CphPdfTool | null>("read");
  return <Toolbar tool={tool} onToolChange={setTool} />;
}

const meta: Meta<typeof DocumentStudio> = {
  title: "Colophon PDF/CphPdfToolbar",
  component: DocumentStudio,
  parameters: { layout: "fullscreen" },
  args: {},
};

export default meta;
type Story = StoryObj<typeof DocumentStudio>;

/** All four toolbar pieces composed above a paged stage. */
export const Default: Story = {};

/** Zoom bounded to 100–125% in 25% steps; the +/- buttons disable at the edges. */
export const BoundedZoom: Story = {
  args: { minZoom: 1, maxZoom: 1.25, step: 0.25 },
};

/** Tool switching driven from outside via a controlled `tool` prop. */
export const ControlledTool: Story = {
  render: () => (
    <CphPdfViewer source={fixtureUrl}>
      <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "0.5rem 1rem",
            borderBottom: "1px solid var(--cph-line)",
          }}
        >
          <ControlledToolbar />
        </div>
        <CphPdfStage layoutMode="single" style={{ flex: 1, minHeight: 0 }} />
      </div>
    </CphPdfViewer>
  ),
};
