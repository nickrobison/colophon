import type { Meta, StoryObj } from "@storybook/react";

import { CphSignalTile } from "../src/components/SignalTile/SignalTile";
const meta: Meta<typeof CphSignalTile> = {
  title: "Colophon/SignalTile",
  component: CphSignalTile,
  args: { label: "Sources indexed", value: "12,483", delta: "+8.4%", mark: "Ⅰ" },
};
export default meta;
type S = StoryObj<typeof CphSignalTile>;
export const Default: S = {};
export const Urgent: S = {
  args: { label: "Open inquiries", value: "17", delta: "3 urgent", mark: "Ⅳ", urgent: true },
};
export const Grid: S = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 1,
        background: "var(--cph-line)",
      }}
    >
      {[
        ["Ⅰ", "12,483", "+8.4%", "Sources indexed"],
        ["Ⅱ", "2,941", "+124", "Active concepts"],
        ["Ⅲ", "38,205", "+12.1%", "Relationships"],
        ["Ⅳ", "17", "3 urgent", "Open inquiries"],
      ].map(([m, v, d, l], i) => (
        <CphSignalTile key={m} mark={m!} value={v!} delta={d!} label={l!} urgent={i === 3} />
      ))}
    </div>
  ),
};
