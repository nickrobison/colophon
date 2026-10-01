import type { Meta, StoryObj } from "@storybook/react";
import { CphTable } from "../src/components/Table/CphTable";
const meta: Meta<typeof CphTable> = { title: "Colophon/Table", component: CphTable };
export default meta;
export const Default: StoryObj<typeof CphTable> = { args: { rows: [{ id: "KPL-041", inquiry: "Civic order", owner: "Ada Mercer", sources: 128, stageLabel: "Synthesis", updated: "12 min ago", note: "Comparison ready.", concepts: [] }] } };
