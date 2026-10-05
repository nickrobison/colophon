import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CphStatusChip } from "./CphStatusChip";

const TONES = ["neutral", "sage", "orange", "error"] as const;

describe("CphStatusChip", () => {
  it.each(TONES)("maps tone %s onto the matching CphBadge class", (tone) => {
    render(<CphStatusChip tone={tone}>Alpha</CphStatusChip>);
    expect(screen.getByText("Alpha")).toHaveClass(`cph-badge--${tone}`);
  });

  it("defaults to the neutral tone", () => {
    render(<CphStatusChip>Alpha</CphStatusChip>);
    expect(screen.getByText("Alpha")).toHaveClass("cph-badge--neutral");
  });

  it("keeps the label reachable by text so status is never colour-only", () => {
    render(<CphStatusChip tone="error">Needs attention</CphStatusChip>);
    // The spec forbids conveying status by colour alone; the text must survive
    // independently of the dot.
    expect(screen.getByText("Needs attention")).toBeInTheDocument();
  });

  it("hides the decorative dot from assistive technology", () => {
    const { container } = render(<CphStatusChip tone="sage">Indexed</CphStatusChip>);
    const dot = container.querySelector(".cph-table__chip-dot");
    expect(dot).not.toBeNull();
    expect(dot).toHaveAttribute("aria-hidden", "true");
  });

  it("accepts an extra className without losing the chip class", () => {
    render(
      <CphStatusChip tone="orange" className="uppercase">
        In review
      </CphStatusChip>,
    );
    const chip = screen.getByText("In review");
    expect(chip).toHaveClass("cph-table__chip");
    expect(chip).toHaveClass("uppercase");
  });
});
