import type { Meta, StoryObj } from "@storybook/react";

import { CphBadge } from "../src/components/Badge/Badge";
import { CphPanel } from "../src/components/Panel/Panel";
const meta: Meta<typeof CphPanel> = {
  title: "Colophon/Panel",
  component: CphPanel,
  args: {
    heading: (
      <div>
        <span className="cph-eyebrow">Corpus composition</span>
        <h2 style={{ margin: "4px 0 0", fontSize: "1.5rem" }}>Dominant fields</h2>
      </div>
    ),
    children: <p>Panel body content.</p>,
    footer: <span>4 of 18</span>,
  },
};
export default meta;
type S = StoryObj<typeof CphPanel>;
export const Default: S = {};
export const WithBadge: S = {
  args: {
    heading: (
      <div style={{ display: "flex", width: "100%", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }}>Dominant fields</h2>
        <CphBadge>4 of 18</CphBadge>
      </div>
    ),
  },
};
