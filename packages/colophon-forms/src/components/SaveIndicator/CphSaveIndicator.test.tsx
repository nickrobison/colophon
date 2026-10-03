import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CphSaveIndicator } from "./CphSaveIndicator";

describe("CphSaveIndicator", () => {
  it('renders the wrapper with "cph-save-indicator--idle" and shows no text', () => {
    const { container } = render(<CphSaveIndicator state="idle" />);
    const span = container.querySelector(".cph-save-indicator");
    expect(span).toHaveClass("cph-save-indicator--idle");
    expect(span).toBeEmptyDOMElement();
  });

  it('shows "Saving…" when state is saving', () => {
    render(<CphSaveIndicator state="saving" />);
    expect(screen.getByText("Saving…")).toBeInTheDocument();
  });

  it('shows "Saved" and contains an svg when state is saved', () => {
    const { container } = render(<CphSaveIndicator state="saved" />);
    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("shows errorMessage when provided, else the fallback", () => {
    const { rerender } = render(<CphSaveIndicator state="error" errorMessage="Network failure" />);
    expect(screen.getByText("Network failure")).toBeInTheDocument();

    rerender(<CphSaveIndicator state="error" />);
    expect(screen.getByText("Couldn't save — retry")).toBeInTheDocument();
  });

  it('has aria-live="polite" in every state', () => {
    const states = ["idle", "saving", "saved", "error"] as const;
    for (const state of states) {
      const { container } = render(<CphSaveIndicator state={state} />);
      const span = container.querySelector(".cph-save-indicator");
      expect(span).toHaveAttribute("aria-live", "polite");
    }
  });
});
