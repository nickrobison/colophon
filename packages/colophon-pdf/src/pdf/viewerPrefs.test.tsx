import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockStageState, type MockStageState } from "../test/mockViewer";
import { CphPdfViewerPrefsProvider } from "./viewerPrefs";
import { useCphPdfViewerPrefs } from "./viewerPrefsContext";

const mocks = vi.hoisted(() => {
  const stage = {
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    zoomBy: vi.fn(),
  };
  const interaction = {
    hasTool: vi.fn<(id: string) => boolean>(),
    registerTool: vi.fn(() => () => {}),
    activateTool: vi.fn(),
    getActiveToolId: vi.fn(() => "pointer"),
  };
  return {
    stage,
    interaction,
    stageState: null as unknown as MockStageState,
    interactionState: { activeToolId: "pointer" as string | null, tools: [] as unknown[] },
  };
});

vi.mock("@embedpdf/react", () => ({
  useStage: () => mocks.stage,
  useStageState: (select?: (state: unknown) => unknown) =>
    select ? select(mocks.stageState) : mocks.stageState,
  useInteraction: () => mocks.interaction,
  useInteractionState: (select?: (state: unknown) => unknown) =>
    select ? select(mocks.interactionState) : mocks.interactionState,
}));

function PrefsProbe() {
  const { tool, canZoomIn, canZoomOut, setTool, setDensity, toggleTheme, zoomIn } =
    useCphPdfViewerPrefs();
  return (
    <div>
      <span data-testid="tool">{tool ?? "none"}</span>
      <span data-testid="can-in">{String(canZoomIn)}</span>
      <span data-testid="can-out">{String(canZoomOut)}</span>
      <button onClick={() => setTool("highlight")}>tool-highlight</button>
      <button onClick={() => setDensity("compact")}>density-compact</button>
      <button onClick={toggleTheme}>toggle-theme</button>
      <button onClick={zoomIn}>zoom-in</button>
    </div>
  );
}

function ZoomPrefsTree() {
  return (
    <CphPdfViewerPrefsProvider minZoom={0.75} maxZoom={1.5}>
      <PrefsProbe />
    </CphPdfViewerPrefsProvider>
  );
}

function renderPrefs(overrides: Record<string, unknown> = {}) {
  const { container } = render(
    <CphPdfViewerPrefsProvider {...overrides}>
      <PrefsProbe />
    </CphPdfViewerPrefsProvider>,
  );
  return {
    shell: container.querySelector(".cph-pdf-viewer__shell"),
  };
}

beforeEach(() => {
  mocks.stageState = createMockStageState();
  mocks.interactionState.activeToolId = "pointer";
  mocks.stage.zoomIn.mockClear();
  mocks.stage.zoomOut.mockClear();
  mocks.stage.zoomBy.mockClear();
  mocks.interaction.hasTool.mockReset();
  mocks.interaction.hasTool.mockReturnValue(true);
  mocks.interaction.registerTool.mockClear();
  mocks.interaction.activateTool.mockClear();
  mocks.interaction.getActiveToolId.mockClear();
  mocks.interaction.getActiveToolId.mockReturnValue("pointer");
});

describe("CphPdfViewerPrefsProvider", () => {
  it("applies the default density and theme to the shell", () => {
    const { shell } = renderPrefs();
    expect(shell).toHaveAttribute("data-density", "comfortable");
    expect(shell).toHaveAttribute("data-theme", "light");
  });

  it("registers the placeholder tools only when the interaction plugin lacks them", () => {
    mocks.interaction.hasTool.mockImplementation((id) => id === "pointer");
    renderPrefs();
    expect(mocks.interaction.registerTool).toHaveBeenCalledWith({
      id: "highlight",
      cursor: "crosshair",
    });
    expect(mocks.interaction.registerTool).toHaveBeenCalledWith({
      id: "comment",
      cursor: "pointer",
    });

    mocks.interaction.hasTool.mockReset();
    mocks.interaction.hasTool.mockReturnValue(true);
    mocks.interaction.registerTool.mockClear();
    renderPrefs();
    expect(mocks.interaction.registerTool).not.toHaveBeenCalled();
  });

  it("maps the interaction tool to the v1 tool and back", async () => {
    const user = userEvent.setup();
    renderPrefs();
    expect(screen.getByTestId("tool")).toHaveTextContent("read");

    await user.click(screen.getByText("tool-highlight"));
    expect(mocks.interaction.activateTool).toHaveBeenCalledWith("highlight");
  });

  it("reports null while a non-v1 tool is active", () => {
    mocks.interactionState.activeToolId = "zoom";
    renderPrefs();
    expect(screen.getByTestId("tool")).toHaveTextContent("none");
  });

  it("changes density through the context and updates the shell", async () => {
    const user = userEvent.setup();
    const { shell } = renderPrefs();

    await user.click(screen.getByText("density-compact"));
    expect(shell).toHaveAttribute("data-density", "compact");
  });

  it("toggles the theme and updates the shell", async () => {
    const user = userEvent.setup();
    const { shell } = renderPrefs();

    await user.click(screen.getByText("toggle-theme"));
    expect(shell).toHaveAttribute("data-theme", "dark");
  });

  it("lets controlled density/theme props win and reports changes", async () => {
    const user = userEvent.setup();
    const onDensityChange = vi.fn();
    const onThemeChange = vi.fn();
    const { shell } = renderPrefs({
      density: "compact",
      theme: "dark",
      onDensityChange,
      onThemeChange,
    });

    expect(shell).toHaveAttribute("data-density", "compact");
    expect(shell).toHaveAttribute("data-theme", "dark");

    await user.click(screen.getByText("density-compact"));
    expect(onDensityChange).toHaveBeenCalledWith("compact");
    expect(shell).toHaveAttribute("data-density", "compact"); // controlled: unchanged

    await user.click(screen.getByText("toggle-theme"));
    expect(onThemeChange).toHaveBeenCalledWith("light");
    expect(shell).toHaveAttribute("data-theme", "dark"); // controlled: unchanged
  });

  it("exposes zoom value, can-zoom flags, and delegates zoomIn to the stage", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ZoomPrefsTree />);
    expect(screen.getByTestId("can-in")).toHaveTextContent("true");
    expect(screen.getByTestId("can-out")).toHaveTextContent("true");

    mocks.stageState.zoomLevel = 1.5;
    rerender(<ZoomPrefsTree />);
    expect(screen.getByTestId("can-in")).toHaveTextContent("false");
    expect(screen.getByTestId("can-out")).toHaveTextContent("true");

    await user.click(screen.getByText("zoom-in"));
    expect(mocks.stage.zoomIn).toHaveBeenCalled();
  });
});
