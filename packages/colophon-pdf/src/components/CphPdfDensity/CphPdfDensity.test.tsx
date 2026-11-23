import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CphPdfViewerPrefsProvider } from "../../pdf/viewerPrefs";
import { createMockStageState, type MockStageState } from "../../test/mockViewer";
import { CphPdfDensity } from "./CphPdfDensity";

const mocks = vi.hoisted(() => ({
  stageState: null as unknown as MockStageState,
  interactionState: { activeToolId: "pointer" as string | null, tools: [] as unknown[] },
}));

vi.mock("@embedpdf/react", () => ({
  useStage: () => ({ zoomIn: vi.fn(), zoomOut: vi.fn(), zoomBy: vi.fn() }),
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

function renderDensity(props: Record<string, unknown> = {}) {
  const { container } = render(
    <CphPdfViewerPrefsProvider {...props}>
      <CphPdfDensity />
    </CphPdfViewerPrefsProvider>,
  );
  return { shell: container.querySelector(".cph-pdf-viewer__shell") };
}

beforeEach(() => {
  mocks.stageState = createMockStageState();
});

describe("CphPdfDensity", () => {
  it("renders a select labelled Density with the three presets", async () => {
    const user = userEvent.setup();
    renderDensity();
    expect(screen.getByRole("group", { name: "Density" })).toBeInTheDocument();

    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("option", { name: "Comfortable" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Compact" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Dense" })).toBeInTheDocument();
  });

  it("writes the choice to the shell as data-density", async () => {
    const user = userEvent.setup();
    const { shell } = renderDensity();
    expect(shell).toHaveAttribute("data-density", "comfortable");

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("option", { name: "Compact" }));
    expect(shell).toHaveAttribute("data-density", "compact");
  });

  it("lets a controlled density prop win and reports changes", async () => {
    const user = userEvent.setup();
    const onDensityChange = vi.fn();
    const { shell } = renderDensity({ density: "dense", onDensityChange });
    expect(shell).toHaveAttribute("data-density", "dense");

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("option", { name: "Compact" }));
    expect(onDensityChange).toHaveBeenCalledWith("compact");
    expect(shell).toHaveAttribute("data-density", "dense"); // controlled: unchanged
  });
});
