import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CphRowDetail } from "./CphRowDetail";

const getByCphTable = (container: HTMLElement, value: string) =>
  container.querySelector(`[data-cph-table="${value}"]`) as HTMLElement;

describe("CphRowDetail", () => {
  it("renders the detail row with the correct colSpan from visibleCellsCount", () => {
    const { container } = render(
      <CphRowDetail visibleCellsCount={5} expanded={true}>
        Detail content
      </CphRowDetail>,
    );
    const td = getByCphTable(container, "detail-cell");
    expect(td).toHaveAttribute("colSpan", "5");
  });

  it("does not hardcode colSpan — it varies with visibleCellsCount", () => {
    const { container, rerender } = render(
      <CphRowDetail visibleCellsCount={3} expanded={true}>
        Detail content
      </CphRowDetail>,
    );
    expect(getByCphTable(container, "detail-cell")).toHaveAttribute("colSpan", "3");

    rerender(
      <CphRowDetail visibleCellsCount={7} expanded={true}>
        Detail content
      </CphRowDetail>,
    );
    expect(getByCphTable(container, "detail-cell")).toHaveAttribute("colSpan", "7");
  });

  it("uses grid-template-rows animation (0fr/1fr), not height or max-height", () => {
    const { container } = render(
      <CphRowDetail visibleCellsCount={4} expanded={true}>
        Detail content
      </CphRowDetail>,
    );
    const animationWrapper = getByCphTable(container, "detail-animation");
    const style = animationWrapper.style;

    expect(style.display).toBe("grid");
    expect(style.gridTemplateRows).toBe("1fr");
    expect(style.transition).toContain("grid-template-rows");
    expect(style.transition).not.toContain("height");
    expect(style.transition).not.toContain("max-height");
  });

  it("has transition-duration of 0.2s (200ms)", () => {
    const { container } = render(
      <CphRowDetail visibleCellsCount={4} expanded={true}>
        Detail content
      </CphRowDetail>,
    );
    const animationWrapper = getByCphTable(container, "detail-animation");
    const style = animationWrapper.style;

    expect(style.transition).toContain("0.2s");
  });

  it("exposes aria-expanded=true when expanded", () => {
    const { container } = render(
      <CphRowDetail visibleCellsCount={4} expanded={true}>
        Detail content
      </CphRowDetail>,
    );
    const row = getByCphTable(container, "detail-row");
    expect(row).toHaveAttribute("aria-expanded", "true");
    expect(row).toHaveAttribute("data-expanded", "true");
  });

  it("exposes aria-expanded=false when collapsed", () => {
    const { container } = render(
      <CphRowDetail visibleCellsCount={4} expanded={false}>
        Detail content
      </CphRowDetail>,
    );
    const row = getByCphTable(container, "detail-row");
    expect(row).toHaveAttribute("aria-expanded", "false");
    expect(row).toHaveAttribute("data-expanded", "false");
  });

  it("renders detail content in the serif face (--cph-font-serif)", () => {
    const { container } = render(
      <CphRowDetail visibleCellsCount={4} expanded={true}>
        Detail content
      </CphRowDetail>,
    );
    const content = getByCphTable(container, "detail-content");
    expect(content.style.fontFamily).toBe("var(--cph-font-serif)");
  });

  it("keeps the row in the DOM when collapsed (uses grid-rows, not display:none)", () => {
    const { container } = render(
      <CphRowDetail visibleCellsCount={4} expanded={false}>
        Detail content
      </CphRowDetail>,
    );
    const row = getByCphTable(container, "detail-row");
    expect(row).toBeInTheDocument();
    expect(row.style.display).not.toBe("none");
  });

  it("applies grid-template-rows: 0fr when collapsed", () => {
    const { container } = render(
      <CphRowDetail visibleCellsCount={4} expanded={false}>
        Detail content
      </CphRowDetail>,
    );
    const animationWrapper = getByCphTable(container, "detail-animation");
    expect(animationWrapper.style.gridTemplateRows).toBe("0fr");
  });

  it("applies grid-template-rows: 1fr when expanded", () => {
    const { container } = render(
      <CphRowDetail visibleCellsCount={4} expanded={true}>
        Detail content
      </CphRowDetail>,
    );
    const animationWrapper = getByCphTable(container, "detail-animation");
    expect(animationWrapper.style.gridTemplateRows).toBe("1fr");
  });

  it("forwards extra props to the tr element", () => {
    render(
      <CphRowDetail
        visibleCellsCount={4}
        expanded={true}
        className="custom-class"
        data-testid="custom-row"
      >
        Detail content
      </CphRowDetail>,
    );
    const row = screen.getByTestId("custom-row");
    expect(row).toHaveClass("custom-class");
  });
});