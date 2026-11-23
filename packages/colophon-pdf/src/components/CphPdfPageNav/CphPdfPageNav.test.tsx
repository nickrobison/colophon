import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CphPdfPageStateProvider } from "../../pdf/pageState";
import { createMockStageState, type MockStageState } from "../../test/mockViewer";
import { CphPdfPageNav } from "./CphPdfPageNav";

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

beforeEach(() => {
  stageMocks.state = createMockStageState();
  stageMocks.goToPage.mockClear();
});

function NavTree() {
  return (
    <CphPdfPageStateProvider>
      <CphPdfPageNav />
    </CphPdfPageStateProvider>
  );
}

function renderNav() {
  return render(<NavTree />);
}

describe("CphPdfPageNav", () => {
  it("renders 'Page 1 of 3' with a polite live region", () => {
    renderNav();
    const indicator = screen.getByRole("status");
    expect(indicator).toHaveTextContent("Page 1 of 3");
    expect(indicator).toHaveAttribute("aria-live", "polite");
  });

  it("Previous/Next navigate via the stage and the indicator follows", async () => {
    const user = userEvent.setup();
    const { rerender } = renderNav();

    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(stageMocks.goToPage).toHaveBeenLastCalledWith(1); // page 2, index 1

    stageMocks.state.currentPageIndex = 1;
    rerender(<NavTree />);
    expect(screen.getByRole("status")).toHaveTextContent("Page 2 of 3");

    await user.click(screen.getByRole("button", { name: "Previous page" }));
    expect(stageMocks.goToPage).toHaveBeenLastCalledWith(0); // back to page 1

    stageMocks.state.currentPageIndex = 0;
    rerender(<NavTree />);
    expect(screen.getByRole("status")).toHaveTextContent("Page 1 of 3");
  });

  it("disables Previous at the first page and Next at the last", () => {
    const { rerender } = renderNav();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Next page" })).toBeEnabled();

    stageMocks.state.currentPageIndex = 2;
    rerender(<NavTree />);
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeEnabled();
  });

  it("exposes an accessible group label and keyboard-reachable buttons", async () => {
    const user = userEvent.setup();
    renderNav();
    expect(screen.getByRole("group", { name: "Page navigation" })).toBeInTheDocument();

    // With Previous disabled at page 1, Tab lands on Next — both are real
    // buttons, so keyboard paging stays reachable (stage-native keyboard
    // scrolling itself is unchanged).
    await user.keyboard("{Tab}");
    expect(screen.getByRole("button", { name: "Next page" })).toHaveFocus();
  });
});
