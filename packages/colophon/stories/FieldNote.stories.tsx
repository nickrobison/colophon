import type { Meta, StoryObj } from "@storybook/react";

import { CphFieldNote } from "../src/components/FieldNote/FieldNote";
const meta: Meta<typeof CphFieldNote> = {
  title: "Colophon/FieldNote",
  component: CphFieldNote,
  args: {
    index: "Nº 04",
    quote: "Knowledge is a network, not a filing cabinet.",
    caption: "Current research principle",
  },
};
export default meta;
type S = StoryObj<typeof CphFieldNote>;
export const Default: S = {
  render: (a) => (
    <div className="cph-sidebar" style={{ position: "static", width: "15.5rem", height: "auto" }}>
      <div className="cph-sidebar__inner">
        <CphFieldNote {...a} />
      </div>
    </div>
  ),
};
