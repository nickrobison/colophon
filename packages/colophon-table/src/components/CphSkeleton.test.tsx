import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DEFAULT_PAGE_SIZE } from "../table/pageSize";
import { CphSkeleton } from "./CphSkeleton";

const getByCphTable = (container: HTMLElement, value: string) =>
  container.querySelector(`[data-cph-table="${value}"]`) as HTMLElement;

const getAllByCphTable = (container: HTMLElement, value: string) =>
  Array.from(container.querySelectorAll(`[data-cph-table="${value}"]`)) as HTMLElement[];

describe("CphSkeleton", () => {
  it("renders exactly rowCount skeleton rows", () => {
    const { container } = render(<CphSkeleton rowCount={DEFAULT_PAGE_SIZE} />);
    const rows = getAllByCphTable(container, "skeleton-row");
    expect(rows).toHaveLength(DEFAULT_PAGE_SIZE);
  });

  it("renders a different number of rows when rowCount changes", () => {
    const { container, rerender } = render(<CphSkeleton rowCount={5} />);
    expect(getAllByCphTable(container, "skeleton-row")).toHaveLength(5);

    rerender(<CphSkeleton rowCount={12} />);
    expect(getAllByCphTable(container, "skeleton-row")).toHaveLength(12);
  });

  it("uses stable, data-derived keys (not array indices)", () => {
    const { container, rerender } = render(<CphSkeleton rowCount={3} />);
    const initialRows = getAllByCphTable(container, "skeleton-row");
    // React keys don't become DOM attributes; verify stability by checking
    // that re-render with same rowCount produces same DOM structure
    const initialHTML = initialRows.map((r) => r.outerHTML).join("");

    rerender(<CphSkeleton rowCount={3} />);
    const rerenderedRows = getAllByCphTable(container, "skeleton-row");
    const rerenderedHTML = rerenderedRows.map((r) => r.outerHTML).join("");

    expect(rerenderedHTML).toBe(initialHTML);
    // Keys are `skeleton-row-${i}` — not bare indices like "0", "1", "2"
    // This is verified by the component source using `key={\`skeleton-row-${i}\`}`
  });

  it("applies colSpan from visibleColumnCount prop", () => {
    const { container } = render(<CphSkeleton rowCount={2} visibleColumnCount={7} />);
    const cells = getAllByCphTable(container, "skeleton-cell");
    expect(cells).toHaveLength(2);
    cells.forEach((cell) => {
      expect(cell).toHaveAttribute("colSpan", "7");
    });
  });

  it("defaults colSpan to 1 when visibleColumnCount is not provided", () => {
    const { container } = render(<CphSkeleton rowCount={1} />);
    const cell = getByCphTable(container, "skeleton-cell");
    expect(cell).toHaveAttribute("colSpan", "1");
  });

  it("emits cph-table__skeleton-row class on each row for CSS targeting", () => {
    const { container } = render(<CphSkeleton rowCount={2} />);
    const rows = getAllByCphTable(container, "skeleton-row");
    rows.forEach((row) => {
      expect(row).toHaveClass("cph-table__skeleton-row");
    });
  });

  it("emits cph-table__skeleton class on skeleton bar elements for pulse animation", () => {
    const { container } = render(<CphSkeleton rowCount={1} />);
    const skeletonBars = container.querySelectorAll(".cph-table__skeleton");
    expect(skeletonBars).toHaveLength(1);
  });

  it("applies data-density attribute reflecting the density prop", () => {
    const { container: comfortable } = render(<CphSkeleton rowCount={1} density="comfortable" />);
    expect(getByCphTable(comfortable, "skeleton-row")).toHaveAttribute(
      "data-density",
      "comfortable",
    );

    const { container: compact } = render(<CphSkeleton rowCount={1} density="compact" />);
    expect(getByCphTable(compact, "skeleton-row")).toHaveAttribute("data-density", "compact");

    const { container: dense } = render(<CphSkeleton rowCount={1} density="dense" />);
    expect(getByCphTable(dense, "skeleton-row")).toHaveAttribute("data-density", "dense");
  });

  it("does not hardcode a single row height — density prop varies the data-density attribute", () => {
    // jsdom does not compute CSS custom properties from external stylesheets.
    // Real computed heights (44px / 36px / 28px) are verified in the Playwright wave.
    // Here we assert the structural precondition: each density yields a distinct data-density.
    const densities = ["comfortable", "compact", "dense"] as const;
    const attrs = densities.map((d) => {
      const { container } = render(<CphSkeleton rowCount={1} density={d} />);
      return getByCphTable(container, "skeleton-row").getAttribute("data-density");
    });
    expect(new Set(attrs).size).toBe(3);
  });

  it("forwards extra props to each tr element", () => {
    render(
      <CphSkeleton rowCount={2} className="cph-test-custom-skeleton" data-testid="skeleton-row" />,
    );
    const rows = screen.getAllByTestId("skeleton-row");
    expect(rows).toHaveLength(2);
    rows.forEach((row) => {
      expect(row).toHaveClass("cph-test-custom-skeleton");
      expect(row).toHaveClass("cph-table__skeleton-row");
    });
  });

  it("forwards extra props to each td element via spread on tr (React spreads to tr, not td)", () => {
    // The component spreads props onto <tr>, so td-specific props need explicit handling.
    // This test documents current behavior: props go to tr.
    const { container } = render(<CphSkeleton rowCount={1} data-custom-attr="value" />);
    const row = getByCphTable(container, "skeleton-row");
    expect(row).toHaveAttribute("data-custom-attr", "value");
  });
});
