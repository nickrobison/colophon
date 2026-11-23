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
export const AllStates: S = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
      <CphProcessingBadge status="pending" label="KPL-041" />
      <CphProcessingBadge status="available" label="KPL-041" />
      <CphProcessingBadge
        status="failed"
        label="KPL-041"
        message="Ingest timed out after 3 attempts."
        onRetry={() => undefined}
      />
    </div>
  ),
};
