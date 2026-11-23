import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Component, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockStageState, type MockStageState } from "../test/mockViewer";
import { CphPdfPageStateProvider } from "./pageState";
import { usePdfPageState } from "./pageStateContext";

const stageMocks = vi.hoisted(() => ({
  // Assigned a fresh object by `beforeEach` before any test renders.
  state: null as unknown as MockStageState,
  goToPage: vi.fn<(index: number) => void>(),
}));

vi.mock("@embedpdf/react", () => ({
  useStage: () => ({
    goToPage: stageMocks.goToPage,
    getCurrentPageIndex: () => stageMocks.state?.currentPageIndex ?? 0,
  }),
  useStageState: (select?: (state: unknown) => unknown) =>
    select ? select(stageMocks.state) : stageMocks.state,
}));

/** Fresh 3-page stage state per test; keeps suites order-independent. */
function resetState() {
  stageMocks.state = createMockStageState();
  stageMocks.goToPage.mockClear();
}

beforeEach(resetState);

function Probe() {
  const { page, pageCount, goTo, setPage } = usePdfPageState();
  return (
    <div>
      <span data-testid="page">{page}</span>
      <span data-testid="count">{pageCount}</span>
      <button onClick={() => goTo(0)}>go-0</button>
      <button onClick={() => goTo(99)}>go-99</button>
      <button onClick={() => setPage(5)}>set-5</button>
    </div>
  );
}

class Boundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    return this.state.error ? <p>{this.state.error.message}</p> : this.props.children;
  }
}

describe("CphPdfPageStateProvider", () => {
  it("mirrors the stage's page as 1-based and exposes the page count", () => {
    render(
      <CphPdfPageStateProvider>
        <Probe />
      </CphPdfPageStateProvider>,
    );
    expect(screen.getByTestId("page")).toHaveTextContent("1");
    expect(screen.getByTestId("count")).toHaveTextContent("3");
  });

  it("clamps goTo to [1, pageCount] and delegates to the stage (0-based)", async () => {
    const user = userEvent.setup();
    render(
      <CphPdfPageStateProvider>
        <Probe />
      </CphPdfPageStateProvider>,
    );

    await user.click(screen.getByText("go-0"));
    expect(stageMocks.goToPage).toHaveBeenLastCalledWith(0); // clamp 0 -> 1 -> index 0

    await user.click(screen.getByText("go-99"));
    expect(stageMocks.goToPage).toHaveBeenLastCalledWith(2); // clamp 99 -> 3 -> index 2

    await user.click(screen.getByText("set-5"));
    expect(stageMocks.goToPage).toHaveBeenLastCalledWith(2); // setPage clamps too
  });

  it("tracks the stage when it changes (uncontrolled, stage is the source of truth)", () => {
    const { rerender } = render(
      <CphPdfPageStateProvider>
        <Probe />
      </CphPdfPageStateProvider>,
    );

    stageMocks.state.currentPageIndex = 1;
    rerender(
      <CphPdfPageStateProvider>
        <Probe />
      </CphPdfPageStateProvider>,
    );
    expect(screen.getByTestId("page")).toHaveTextContent("2");
  });

  it("lets a controlled page prop win over the mirror and clamps out-of-range values", () => {
    const { rerender } = render(
      <CphPdfPageStateProvider page={2}>
        <Probe />
      </CphPdfPageStateProvider>,
    );
    expect(screen.getByTestId("page")).toHaveTextContent("2");

    rerender(
      <CphPdfPageStateProvider page={99}>
        <Probe />
      </CphPdfPageStateProvider>,
    );
    expect(screen.getByTestId("page")).toHaveTextContent("3"); // clamped to pageCount
  });

  it("reports stage page changes to onPageChange, but never on the initial sync", () => {
    const onPageChange = vi.fn();
    const { rerender } = render(
      <CphPdfPageStateProvider page={1} onPageChange={onPageChange}>
        <Probe />
      </CphPdfPageStateProvider>,
    );
    expect(onPageChange).not.toHaveBeenCalled();

    stageMocks.state.currentPageIndex = 1;
    rerender(
      <CphPdfPageStateProvider page={1} onPageChange={onPageChange}>
        <Probe />
      </CphPdfPageStateProvider>,
    );
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("is a no-op without a document (pageCount 0)", async () => {
    const user = userEvent.setup();
    stageMocks.state.pageCount = 0;
    stageMocks.state.currentPageIndex = 0;

    render(
      <CphPdfPageStateProvider>
        <Probe />
      </CphPdfPageStateProvider>,
    );
    expect(screen.getByTestId("page")).toHaveTextContent("0");

    await user.click(screen.getByText("go-99"));
    expect(stageMocks.goToPage).not.toHaveBeenCalled();
  });

  it("re-subscribes when the page prop arrives after mount (late controlled)", () => {
    const onPageChange = vi.fn();
    const { rerender } = render(
      <CphPdfPageStateProvider>
        <Probe />
      </CphPdfPageStateProvider>,
    );
    expect(screen.getByTestId("page")).toHaveTextContent("1");

    rerender(
      <CphPdfPageStateProvider page={2} onPageChange={onPageChange}>
        <Probe />
      </CphPdfPageStateProvider>,
    );
    expect(screen.getByTestId("page")).toHaveTextContent("2");
  });

  it("throws when used outside the provider", () => {
    render(
      <Boundary>
        <Probe />
      </Boundary>,
    );
    expect(screen.getByText(/usePdfPageState must be used inside/)).toBeInTheDocument();
  });

  it("jumps the stage to the controlled page on mount", () => {
    render(
      <CphPdfPageStateProvider page={3}>
        <Probe />
      </CphPdfPageStateProvider>,
    );
    // Stage opens on index 0; the controlled page 3 (index 2) must be applied.
    expect(stageMocks.goToPage).toHaveBeenCalledWith(2);
  });

  it("moves the stage when the controlled page prop changes", () => {
    const { rerender } = render(
      <CphPdfPageStateProvider page={1}>
        <Probe />
      </CphPdfPageStateProvider>,
    );
    expect(stageMocks.goToPage).not.toHaveBeenCalled(); // already on page 1

    rerender(
      <CphPdfPageStateProvider page={2}>
        <Probe />
      </CphPdfPageStateProvider>,
    );
    expect(stageMocks.goToPage).toHaveBeenCalledWith(1); // page 2, index 1
  });

  it("snaps a drifted stage back to the controlled page", () => {
    const { rerender } = render(
      <CphPdfPageStateProvider page={1}>
        <Probe />
      </CphPdfPageStateProvider>,
    );
    expect(stageMocks.goToPage).not.toHaveBeenCalled();

    // The stage moved (scroll/outline jump) to page 2 while controlled to 1.
    stageMocks.state.currentPageIndex = 1;
    rerender(
      <CphPdfPageStateProvider page={1}>
        <Probe />
      </CphPdfPageStateProvider>,
    );
    expect(stageMocks.goToPage).toHaveBeenCalledWith(0);
  });

  it("shows 0 in controlled mode while there is no document", () => {
    stageMocks.state.pageCount = 0;

    render(
      <CphPdfPageStateProvider page={5}>
        <Probe />
      </CphPdfPageStateProvider>,
    );
    expect(screen.getByTestId("page")).toHaveTextContent("0");
    expect(stageMocks.goToPage).not.toHaveBeenCalled();
  });
});
