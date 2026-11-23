import type { Meta, StoryObj } from "@storybook/react";

import { CphProcessingBadge } from "../src/components/CphProcessingBadge/CphProcessingBadge";

const meta: Meta<typeof CphProcessingBadge> = {
  title: "Colophon/CphProcessingBadge",
  component: CphProcessingBadge,
};
export default meta;
type S = StoryObj<typeof CphProcessingBadge>;
export const Pending: S = { args: { status: "pending", label: "KPL-041" } };
export const Available: S = { args: { status: "available", label: "KPL-041" } };
export const Failed: S = {
  args: { status: "failed", label: "KPL-041", message: "Ingest timed out after 3 attempts." },
};
export const FailedWithRetry: S = {
  args: {
    status: "failed",
    label: "KPL-041",
    message: "Ingest timed out after 3 attempts.",
    onRetry: () => undefined,
  },
};
