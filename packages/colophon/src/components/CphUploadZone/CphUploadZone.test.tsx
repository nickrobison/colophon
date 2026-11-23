import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CphUploadZone } from "./CphUploadZone";

const LABEL = "Upload transcript";

function pdfFile(name = "ncr-1042.pdf") {
  return new File(["%PDF-1.4 fake content"], name, { type: "application/pdf" });
}

function txtFile(name = "notes.txt") {
  return new File(["plain text"], name, { type: "text/plain" });
}

function imageFile(name = "ncr-1043.png") {
  return new File(["%PNG fake"], name, { type: "image/png" });
}

function createFakeDataTransfer(files: File[]): DataTransfer {
  return {
    types: ["Files"],
    items: files.map((file) => ({
      kind: "file",
      type: file.type,
      name: file.name,
      getAsFile: () => file,
    })),
  } as unknown as DataTransfer;
}

function getZone() {
  return screen.getByLabelText(LABEL);
}

function getTrigger(container: HTMLElement) {
  const button = container.querySelector<HTMLButtonElement>(".cph-upload-zone__trigger");
  expect(button).not.toBeNull();
  return button as HTMLButtonElement;
}

function getInput(container: HTMLElement) {
  const input = container.querySelector<HTMLInputElement>('input[type="file"]');
  expect(input).not.toBeNull();
  return input as HTMLInputElement;
}

describe("CphUploadZone", () => {
  it("renders the drop zone with an accessible name and a visible trigger", () => {
    const { container } = render(<CphUploadZone label={LABEL} accept={[".pdf"]} />);

    expect(getZone()).toBeInTheDocument();
    expect(getTrigger(container)).toBeInTheDocument();
    expect(getInput(container)).toHaveAttribute("accept", ".pdf");
  });

  it("renders the default hint when no hints are provided", () => {
    render(<CphUploadZone label={LABEL} accept={[".pdf"]} />);

    expect(screen.getByText("Drop files here or select above.")).toBeInTheDocument();
  });

  it("renders consumer hints while idle", () => {
    render(
      <CphUploadZone label={LABEL} accept={[".pdf"]} hints={["PDF files only, up to 10 MB"]} />,
    );

    expect(screen.getByText("PDF files only, up to 10 MB")).toBeInTheDocument();
  });

  it("does not render the hint while uploading", () => {
    render(<CphUploadZone label={LABEL} isUploading progress={60} />);

    expect(screen.queryByText("Drop files here or select above.")).not.toBeInTheDocument();
  });

  it("exposes upload progress through the meter while uploading", () => {
    render(<CphUploadZone label={LABEL} isUploading progress={60} />);

    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuenow", "60");
  });

  it("renders the error in an alert region", () => {
    render(<CphUploadZone label={LABEL} error="Only PDF files are supported." />);

    expect(screen.getByRole("alert")).toHaveTextContent("Only PDF files are supported.");
  });

  it("disables the zone while uploading", () => {
    const { container } = render(<CphUploadZone label={LABEL} isUploading progress={10} />);

    expect(getTrigger(container)).toBeDisabled();
    expect(container.querySelector("[data-disabled]")).not.toBeNull();
  });

  it("disables the zone when disabled", () => {
    const { container } = render(<CphUploadZone label={LABEL} disabled />);

    expect(getTrigger(container)).toBeDisabled();
    expect(container.querySelector("[data-disabled]")).not.toBeNull();
  });

  it("accepts a single file through the picker", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <CphUploadZone label={LABEL} accept={[".pdf"]} onSelect={onSelect} />,
    );

    await user.upload(getInput(container), pdfFile());

    expect(onSelect).toHaveBeenCalledTimes(1);
    const [accepted] = onSelect.mock.calls[0] as [File[]];
    expect(accepted).toHaveLength(1);
    expect(accepted[0]?.name).toBe("ncr-1042.pdf");
    expect(screen.getByText(/ncr-1042\.pdf/)).toBeInTheDocument();
  });

  it("accepts multiple files through the picker when multiple is set", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <CphUploadZone label={LABEL} accept={[".pdf", "image/*"]} multiple onSelect={onSelect} />,
    );

    await user.upload(getInput(container), [pdfFile("ncr-1042.pdf"), imageFile("ncr-1043.png")]);

    expect(onSelect).toHaveBeenCalledTimes(1);
    const [accepted] = onSelect.mock.calls[0] as [File[]];
    expect(accepted).toHaveLength(2);
    expect(accepted.map((file) => file.name)).toEqual(["ncr-1042.pdf", "ncr-1043.png"]);
  });

  it("filters rejected file types before calling onSelect", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <CphUploadZone label={LABEL} accept={[".pdf"]} onSelect={onSelect} />,
    );

    await user.upload(getInput(container), txtFile());

    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.queryByText(/notes\.txt/)).not.toBeInTheDocument();
  });

  it("accepts a dropped file", async () => {
    const onSelect = vi.fn();
    render(<CphUploadZone label={LABEL} accept={[".pdf"]} onSelect={onSelect} />);

    fireEvent.drop(getZone(), { dataTransfer: createFakeDataTransfer([pdfFile()]) });

    await vi.waitFor(() => {
      expect(onSelect).toHaveBeenCalledTimes(1);
    });
    const [accepted] = onSelect.mock.calls[0] as [File[]];
    expect(accepted).toHaveLength(1);
    expect(accepted[0]?.name).toBe("ncr-1042.pdf");
  });

  it("does not accept dropped files outside the accept list", async () => {
    const onSelect = vi.fn();
    render(<CphUploadZone label={LABEL} accept={[".pdf"]} onSelect={onSelect} />);

    fireEvent.drop(getZone(), { dataTransfer: createFakeDataTransfer([txtFile()]) });

    await vi.waitFor(() => {
      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  it("opens the picker when the visible trigger is pressed", async () => {
    const user = userEvent.setup();
    const { container } = render(<CphUploadZone label={LABEL} accept={[".pdf"]} />);
    const input = getInput(container);
    const clickSpy = vi.spyOn(input, "click");

    await user.click(getTrigger(container));

    expect(clickSpy).toHaveBeenCalledTimes(1);
  });
});
