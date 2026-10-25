import type { Meta, StoryObj } from "@storybook/react";

import { CphButton } from "../src/components/Button/CphButton";
import { CphDialog } from "../src/components/Dialog/CphDialog";

const meta: Meta<typeof CphDialog> = {
  title: "Colophon/CphDialog",
  component: CphDialog,
};
export default meta;

export const Modal: StoryObj<typeof CphDialog> = {
  args: {
    defaultOpen: true,
    title: "Confirm synthesis",
    description: "This will queue the batch for the next run.",
    children:
      "The synthesis ledger will be updated once the run completes. You can track progress from the inquiry register.",
    footer: (
      <>
        <CphButton variant="secondary">Cancel</CphButton>
        <CphButton>Confirm</CphButton>
      </>
    ),
  },
};

export const Bottom: StoryObj<typeof CphDialog> = {
  args: {
    defaultOpen: true,
    placement: "bottom",
    title: "Quick capture",
    description: "Jot a note without leaving the page.",
    children: "Bottom sheets anchor to the viewport edge and stay dismissible.",
  },
};

export const Right: StoryObj<typeof CphDialog> = {
  args: {
    defaultOpen: true,
    placement: "right",
    size: "lg",
    title: "Inquiry detail",
    description: "KPL-041 · Synthesis",
    children:
      "Drawers slide in from the right edge and hold tall content with an internal scroll region.",
  },
};

export const Fullscreen: StoryObj<typeof CphDialog> = {
  args: {
    defaultOpen: true,
    placement: "fullscreen",
    title: "Ledger review",
    description: "Full-viewport workspace for dense review sessions.",
    children:
      "Fullscreen dialogs cover the viewport. Focus is not trapped, so Tab can move back to the page.",
  },
};
