import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";

import { CphCard } from "../src/components/Card/Card";
const meta: Meta<typeof CphCard> = { title: "Colophon/Card", component: CphCard };
export default meta;
export const Default: StoryObj<typeof CphCard> = {
  args: {
    id: "KPL-041",
    title: "The observable roots of civic order",
    owner: "Ada Mercer",
    sources: 128,
    stageLabel: "Synthesis",
    note: "Corpus supports comparison.",
    concepts: ["Empiricism", "Civic order"],
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.click(c.getByRole("button", { name: "Read note" }));
    await expect(c.getByText("Corpus supports comparison.")).toBeVisible();
  },
};
