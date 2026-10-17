import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CphAlert } from "./CphAlert";

describe("CphAlert", () => {
  it("renders neutral status by default", () => {
    render(<CphAlert message="Corpus synced" />);
    const alert = screen.getByRole("status");
    expect(alert).toHaveClass("cph-alert--neutral", "cph-alert--inline");
    expect(alert).toHaveAttribute("aria-live", "polite");
    expect(alert).toHaveAttribute("aria-label", "Neutral alert");
    expect(screen.getByText("Corpus synced")).toBeVisible();
  });
  it("announces error tone assertively", () => {
    render(<CphAlert tone="error" message="Sync failed" />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("cph-alert--error");
    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(alert).toHaveAttribute("aria-label", "Error alert");
  });
  it("maps sage and orange to polite status", () => {
    const { rerender } = render(<CphAlert tone="sage" message="Saved" />);
    expect(screen.getByRole("status")).toHaveClass("cph-alert--sage");
    rerender(<CphAlert tone="orange" message="Stale" />);
    expect(screen.getByRole("status")).toHaveClass("cph-alert--orange");
  });
  it("renders a header and drops the aria-label when present", () => {
    render(<CphAlert tone="error" header="Export failed" message="Try again" />);
    const alert = screen.getByRole("alert");
    expect(screen.getByText("Export failed")).toBeVisible();
    expect(alert).not.toHaveAttribute("aria-label");
  });
  it("renders a decorative icon", () => {
    render(<CphAlert icon={<svg data-testid="icon" />} message="Queued" />);
    expect(screen.getByTestId("icon").closest("span")).toHaveAttribute("aria-hidden", "true");
  });
  it("calls onDismiss when the dismiss button is pressed", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<CphAlert message="Queued" dismiss onDismiss={onDismiss} />);
    await user.click(screen.getByRole("button", { name: "Dismiss alert" }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
  it("adds the banner variant class", () => {
    render(<CphAlert variant="banner" message="Digest ready" />);
    expect(screen.getByRole("status")).toHaveClass("cph-alert--banner");
  });
  it("merges className", () => {
    render(<CphAlert message="Queued" className="custom-alert" />);
    expect(screen.getByRole("status")).toHaveClass("custom-alert");
  });
});
