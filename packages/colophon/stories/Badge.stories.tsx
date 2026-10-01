import type { Meta, StoryObj } from "@storybook/react";

import { CphBadge } from "../src/components/Badge/Badge";
const meta: Meta<typeof CphBadge> = { title: "Colophon/Badge", component: CphBadge };
export default meta;
export const Neutral: StoryObj<typeof CphBadge> = { args: { children: "KPL-041" } };
export const Orange: StoryObj<typeof CphBadge> = {
  args: { children: "Synthesis", tone: "orange" },
};
export const Sage: StoryObj<typeof CphBadge> = { args: { children: "+8.4%", tone: "sage" } };
export const Error: StoryObj<typeof CphBadge> = { args: { children: "3 urgent", tone: "error" } };
