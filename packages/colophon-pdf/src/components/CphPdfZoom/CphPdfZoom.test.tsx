import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CphPdfViewerPrefsProvider } from "../../pdf/viewerPrefs";
import { createMockStageState, type MockStageState } from "../../test/mockViewer";
import { CphPdfZoom } from "./CphPdfZoom";

const mocks = vi.hoisted(() => {
  const stage = {
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    zoomBy: vi.fn(),
  };
  return {
    stage,
    stageState: null as unknown as MockStageState,
    interactionState: { activeToolId: "pointer" as string | null, tools: [] as unknown[] },
  };
});

vi.mock("@embedpdf/react", () => ({
  useStage: () => mocks.stage,
  useStageState: (select?: (state: unknown) => unknown) =>
    select ? select(mocks.stageState) : mocks.stageState,
  useInteraction: () => ({
    hasTool: vi.fn(() => true),
    registerTool: vi.fn(() => () => {}),
    activateTool: vi.fn(),
    getActiveToolId: vi.fn(() => "pointer"),
  }),
  useInteractionState: (select?: (state: unknown) => unknown) =>
    select ? select(mocks.interactionState) : mocks.interactionState,
}));

function renderZoom(props: Parameters<typeof CphPdfZoom>[0] = {}) {
  return render(
    <CphPdfViewerPrefsProvider>
      <CphPdfZoom {...props} />
    </CphPdfViewerPrefsProvider>,
  );
}

function ZoomTree() {
  return (
    <CphPdfViewerPrefsProvider>
      <CphPdfZoom minZoom={1} maxZoom={2} />
    </CphPdfViewerPrefsProvider>
  );
}

beforeEach(() => {
  mocks.stageState = createMockStageState();
  mocks.stage.zoomIn.mockClear();
  mocks.stage.zoomOut.mockClear();
  mocks.stage.zoomBy.mockClear();
});

describe("CphPdfZoom", () => {
  it("renders the level as a percentage with a polite live region", () => {
    renderZoom();
    const level = screen.getByRole("status");
    expect(level).toHaveTextContent("100%");
    expect(level).toHaveAttribute("aria-live", "polite");
  });

  it("zooms via the stage's native zoomIn/zoomOut by default and updates the label", async () => {
    const user = userEvent.setup();
    const { rerender } = renderZoom();

    await user.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(mocks.stage.zoomIn).toHaveBeenCalledTimes(1);
    expect(mocks.stage.zoomBy).not.toHaveBeenCalled();

    mocks.stageState.zoomLevel = 1.25;
    rerender(
      <CphPdfViewerPrefsProvider>
        <CphPdfZoom />
      </CphPdfViewerPrefsProvider>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("125%");

    await user.click(screen.getByRole("button", { name: "Zoom out" }));
    expect(mocks.stage.zoomOut).toHaveBeenCalledTimes(1);
  });

  it("disables the buttons at the configured bounds", () => {
    const { rerender } = render(<ZoomTree />);
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Zoom in" })).toBeEnabled();

    mocks.stageState.zoomLevel = 2;
    rerender(<ZoomTree />);
    expect(screen.getByRole("button", { name: "Zoom in" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeEnabled();
  });

  it("respects a custom step additively via zoomBy", async () => {
    const user = userEvent.setup();
    const { rerender } = renderZoom({ minZoom: 1, maxZoom: 2, step: 0.5 });

    await user.click(screen.getByRole("button", { name: "Zoom in" }));
    // 100% → 150%: zoomBy((1 + 0.5) / 1).
    expect(mocks.stage.zoomBy).toHaveBeenCalledWith(1.5);
    expect(mocks.stage.zoomIn).not.toHaveBeenCalled();

    mocks.stageState.zoomLevel = 1.5;
    rerender(
      <CphPdfViewerPrefsProvider>
        <CphPdfZoom minZoom={1} maxZoom={2} step={0.5} />
      </CphPdfViewerPrefsProvider>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("150%");

    await user.click(screen.getByRole("button", { name: "Zoom out" }));
    expect(mocks.stage.zoomBy).toHaveBeenLastCalledWith(1 / 1.5);
  });
});
