import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CphProcessingBadge } from "./CphProcessingBadge";

describe("CphProcessingBadge", () => {
  it("renders a pending chip with spinner and label", () => {
    render(<CphProcessingBadge status="pending" label="KPL-041" />);
    const badge = screen.getByRole("status");
    expect(badge).toHaveClass("cph-processing-badge", "cph-processing-badge--pending");
    expect(badge).toHaveAttribute("aria-live", "polite");
    expect(screen.getByText("KPL-041")).toBeVisible();
    expect(badge.querySelector(".cph-processing-badge__spinner")).not.toBeNull();
    expect(badge.querySelector(".cph-processing-badge__spinner svg")).toHaveClass("cph-spin");
  });
  it("renders a neutral chip without spinner while available", () => {
    render(<CphProcessingBadge status="available" label="KPL-041" />);
    const badge = screen.getByRole("status");
    expect(badge).toHaveClass("cph-processing-badge", "cph-processing-badge--available");
    expect(screen.getByText("KPL-041")).toBeVisible();
    expect(badge.querySelector(".cph-processing-badge__spinner")).toBeNull();
  });
  it("renders an alert chip with the error message when failed", () => {
    render(<CphProcessingBadge status="failed" label="KPL-041" message="Ingest timed out" />);
    const badge = screen.getByRole("alert");
    expect(badge).toHaveClass("cph-processing-badge", "cph-processing-badge--failed");
    expect(badge).toHaveAttribute("aria-live", "assertive");
    expect(screen.getByText("Ingest timed out")).toBeVisible();
  });
  it("falls back to the label when a failed chip has no message", () => {
    render(<CphProcessingBadge status="failed" label="KPL-041" />);
    expect(screen.getByText("KPL-041")).toBeVisible();
  });
  it("renders a retry button and fires onRetry when failed", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<CphProcessingBadge status="failed" label="KPL-041" onRetry={onRetry} />);
    const retryButton = screen.getByRole("button", { name: "Retry" });
    await user.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
  it("omits the retry button when no onRetry handler is provided", () => {
    render(<CphProcessingBadge status="failed" label="KPL-041" />);
    expect(screen.queryByRole("button")).toBeNull();
  });
  it("merges className", () => {
    render(<CphProcessingBadge status="available" label="KPL-041" className="mt-4" />);
    expect(screen.getByRole("status")).toHaveClass("mt-4");
  });
});
