import type { Meta, StoryObj } from "@storybook/react";

import { CphDialog } from "../src/components/Dialog/CphDialog";

const meta: Meta<typeof CphDialog> = {
  title: "Colophon/Dialog",
  component: CphDialog,
  args: {
    title: "Confirm action",
    description: "Are you sure you want to proceed?",
    trigger: <button>Open dialog</button>,
  },
};

export default meta;
type S = StoryObj<typeof CphDialog>;

export const Modal: S = {};
export const Bottom: S = { args: { placement: "bottom", size: "md" } };
export const Right: S = { args: { placement: "right", size: "lg" } };
export const Fullscreen: S = { args: { placement: "fullscreen", size: "lg" } };
export const WithFooter: S = {
  args: {
    footer: (
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button>Cancel</button>
        <button>Confirm</button>
      </div>
    ),
  },
};
