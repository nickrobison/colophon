import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "@storybook/test";

import { CphUploadZone } from "../src/components/CphUploadZone/CphUploadZone";

const meta: Meta<typeof CphUploadZone> = { title: "Colophon/UploadZone", component: CphUploadZone };
export default meta;

export const Default: StoryObj<typeof CphUploadZone> = {
  args: { label: "Upload transcript", accept: [".pdf"], hints: ["PDF files only"] },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) {
      throw new Error("File input not found");
    }
    const file = new File(["%PDF-1.4 fake"], "ncr-1042.pdf", { type: "application/pdf" });
    await userEvent.upload(input, file);
    await expect(c.getByText(/ncr-1042\.pdf/)).toBeInTheDocument();
  },
};

export const Multiple: StoryObj<typeof CphUploadZone> = {
  args: {
    label: "Upload attachments",
    accept: [".pdf", "image/*"],
    multiple: true,
    hints: ["PDFs or images"],
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const input = canvasElement.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) {
      throw new Error("File input not found");
    }
    const fileA = new File(["%PDF-1.4 fake"], "ncr-1042.pdf", { type: "application/pdf" });
    const fileB = new File(["%PNG fake"], "ncr-1043.png", { type: "image/png" });
    await userEvent.upload(input, [fileA, fileB]);
    await expect(c.getByText(/ncr-1042\.pdf/)).toBeInTheDocument();
    await expect(c.getByText(/ncr-1043\.png/)).toBeInTheDocument();
  },
};

export const Uploading: StoryObj<typeof CphUploadZone> = {
  args: { label: "Upload transcript", accept: [".pdf"], isUploading: true, progress: 60 },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("meter")).toHaveAttribute("aria-valuenow", "60");
  },
};

export const UploadError: StoryObj<typeof CphUploadZone> = {
  args: { label: "Upload transcript", accept: [".pdf"], error: "Only PDF files are supported." },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole("alert")).toHaveTextContent("Only PDF files are supported.");
  },
};

export const Disabled: StoryObj<typeof CphUploadZone> = {
  args: { label: "Upload transcript", accept: [".pdf"], disabled: true },
  play: async ({ canvasElement }) => {
    const trigger = canvasElement.querySelector<HTMLButtonElement>("button.cph-btn");
    if (!trigger) {
      throw new Error("Trigger button not found");
    }
    await expect(trigger).toBeDisabled();
  },
};
