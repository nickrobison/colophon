import type { Meta, StoryObj } from "@storybook/react";

import fixtureUrl from "../fixtures/basic.pdf?url";
import { CphPdfViewer, usePdfViewer } from "../src";

/** Proves the context is live inside the viewer without adding product UI. */
function ViewerProbe() {
  const { status, documentId } = usePdfViewer();
  return (
    <p style={{ padding: "1rem", margin: 0 }}>
      status: {status} · document: {documentId ?? "—"}
    </p>
  );
}

const meta: Meta<typeof CphPdfViewer> = {
  title: "Colophon PDF/CphPdfViewer",
  component: CphPdfViewer,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof CphPdfViewer>;

/** Real EmbedPDF engine opening the committed three-page fixture. */
export const Ready: Story = {
  args: {
    source: fixtureUrl,
    children: <ViewerProbe />,
  },
};

/** A loader that never resolves: shows the loading announcement and region. */
export const Loading: Story = {
  args: {
    source: () => new Promise<never>(() => {}),
  },
};
