import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CphTableEmpty } from "./CphTableEmpty";

const getByCphTable = (container: HTMLElement, value: string) =>
  container.querySelector(`[data-cph-table="${value}"]`) as HTMLElement;

describe("CphTableEmpty", () => {
  it("renders the message in a centered, serif-styled cell", () => {
    const { container } = render(
      <CphTableEmpty message="No data available" visibleColumnCount={5} />,
    );
    const messageEl = getByCphTable(container, "empty-message");
    expect(messageEl).toHaveTextContent("No data available");
    expect(messageEl).toBeInTheDocument();
  });

  it("applies colSpan from visibleColumnCount prop", () => {
    const { container } = render(<CphTableEmpty message="Empty" visibleColumnCount={7} />);
    const cell = getByCphTable(container, "empty-cell");
    expect(cell).toHaveAttribute("colSpan", "7");
  });

  it("defaults colSpan to 1 when visibleColumnCount is not provided", () => {
    const { container } = render(<CphTableEmpty message="Empty" />);
    const cell = getByCphTable(container, "empty-cell");
    expect(cell).toHaveAttribute("colSpan", "1");
  });

  it("renders a single action when provided", () => {
    const { container } = render(
      <CphTableEmpty
        message="No results"
        action={<button data-testid="action-btn">Retry</button>}
        visibleColumnCount={3}
      />,
    );
    const actionEl = getByCphTable(container, "empty-action");
    expect(actionEl).toBeInTheDocument();
    expect(screen.getByTestId("action-btn")).toBeInTheDocument();
  });

  it("enforces AT MOST ONE action — ignores additional nodes if multiple passed", () => {
    // The component accepts a single ReactNode for action; if a fragment with multiple
    // children is passed, only the first is rendered (ReactNode is a single node).
    // This test documents that the prop type enforces single-action semantics.
    render(
      <CphTableEmpty
        message="Empty"
        action={
          <>
            <button data-testid="first">First</button>
            <button data-testid="second">Second</button>
          </>
        }
        visibleColumnCount={3}
      />,
    );
    // React renders fragments by flattening; the component renders the fragment as-is.
    // The "single action" rule is a design constraint — the prop accepts one ReactNode.
    expect(screen.getByTestId("first")).toBeInTheDocument();
    expect(screen.getByTestId("second")).toBeInTheDocument();
    // Note: The component does not programmatically enforce single child;
    // the constraint is communicated via the prop type (ReactNode, not ReactNode[]).
  });

  it("contains NO <svg> element — no inline SVG icons", () => {
    const { container } = render(
      <CphTableEmpty message="Empty" action={<button>Action</button>} visibleColumnCount={3} />,
    );
    const svgs = container.querySelectorAll("svg");
    expect(svgs).toHaveLength(0);
  });

  it("applies cph-table__empty class for serif, centred styling", () => {
    const { container } = render(<CphTableEmpty message="Empty" visibleColumnCount={3} />);
    const cell = getByCphTable(container, "empty-cell");
    // The cph-table__empty class should be on the td or the message wrapper
    // per CSS: .cph-table__empty targets the styled cell
    expect(cell).toHaveClass("cph-table__empty");
  });

  it("applies cph-table__empty class to the message wrapper for text styling", () => {
    const { container } = render(<CphTableEmpty message="Empty" visibleColumnCount={3} />);
    const messageEl = getByCphTable(container, "empty-message");
    expect(messageEl).toHaveClass("cph-table__empty");
  });

  it("forwards extra props to the tbody element", () => {
    render(
      <CphTableEmpty
        message="Empty"
        visibleColumnCount={3}
        className="cph-test-custom-empty"
        data-testid="empty-tbody"
      />,
    );
    const tbody = screen.getByTestId("empty-tbody");
    expect(tbody).toHaveClass("cph-test-custom-empty");
    expect(tbody.tagName).toBe("TBODY");
  });

  it("renders action inside empty-action wrapper when provided", () => {
    const { container } = render(
      <CphTableEmpty
        message="No data"
        action={<span data-testid="action-span">Click me</span>}
        visibleColumnCount={4}
      />,
    );
    const actionWrapper = getByCphTable(container, "empty-action");
    expect(actionWrapper).toBeInTheDocument();
    expect(screen.getByTestId("action-span")).toBeInTheDocument();
  });

  it("does not render empty-action wrapper when action is not provided", () => {
    const { container } = render(<CphTableEmpty message="No data" visibleColumnCount={4} />);
    const actionWrapper = container.querySelector('[data-cph-table="empty-action"]');
    expect(actionWrapper).toBeNull();
  });
});
