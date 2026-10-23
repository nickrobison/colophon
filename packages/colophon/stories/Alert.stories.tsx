import type { Meta, StoryObj } from "@storybook/react";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

import { CphAlert } from "../src/components/Alert/CphAlert";
const meta: Meta<typeof CphAlert> = { title: "Colophon/Alert", component: CphAlert };
export default meta;
type S = StoryObj<typeof CphAlert>;
export const Neutral: S = { args: { message: "Corpus snapshot queued for overnight rebuild." } };
export const Sage: S = {
  args: { tone: "sage", message: "Export finished — 1,284 rows written." },
};
export const Orange: S = {
  args: { tone: "orange", message: "3 sources have not been refreshed in 30 days." },
};
export const Error: S = {
  args: { tone: "error", message: "Sync failed. Check the ingest endpoint and retry." },
};
export const WithHeader: S = {
  args: {
    tone: "error",
    header: "Export failed",
    message: "The corpus contains unsaved synthesis notes.",
  },
};
export const WithIcon: S = {
  args: { tone: "sage", icon: <CheckCircle2 size={14} />, message: "All sources reconciled." },
};
export const WithDismiss: S = {
  args: {
    tone: "orange",
    icon: <AlertTriangle size={14} />,
    message: "Draft stages will be archived after 14 days.",
    dismiss: true,
  },
};
export const Banner: S = {
  args: {
    tone: "error",
    icon: <XCircle size={14} />,
    header: "Ingest offline",
    message: "New sources will queue until the endpoint recovers.",
    variant: "banner",
  },
};
