import type { Meta, StoryObj } from "@storybook/react";

import fixtureUrl from "../fixtures/basic.pdf?url";
import { CphPdfPageNav, CphPdfStage, CphPdfViewer } from "../src";

interface DocumentStudioProps {
  /** Continuous scroll vs one page at a time. */
  layoutMode?: "single" | "continuous";
}

/**
 * Full viewer composition: page nav above a sized stage. No `play` function —
 * the planned e2e specs target these exact stories.
 */
function DocumentStudio({ layoutMode = "single" }: DocumentStudioProps) {
  return (
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
          <CphPdfPageNav />
        </div>
        <CphPdfStage layoutMode={layoutMode} style={{ flex: 1, minHeight: 0 }} />
      </div>
    </CphPdfViewer>
  );
}

const meta: Meta<typeof DocumentStudio> = {
  title: "Colophon PDF/CphPdfStage",
  component: DocumentStudio,
  parameters: { layout: "fullscreen" },
  args: { layoutMode: "single" },
};

export default meta;
type Story = StoryObj<typeof DocumentStudio>;

/** One page at a time; Previous/Next step between the three fixture pages. */
export const Paged: Story = {};

/** The whole document in one scroll; the nav follows the page under the fold. */
export const Continuous: Story = {
  args: { layoutMode: "continuous" },
};
