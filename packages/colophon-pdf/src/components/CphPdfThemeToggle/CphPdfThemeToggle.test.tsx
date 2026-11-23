import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CphPdfViewerPrefsProvider } from "../../pdf/viewerPrefs";
import { createMockStageState, type MockStageState } from "../../test/mockViewer";
import { CphPdfThemeToggle } from "./CphPdfThemeToggle";

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

function renderToggle(props: Record<string, unknown> = {}) {
  const { container } = render(
    <CphPdfViewerPrefsProvider {...props}>
      <CphPdfThemeToggle />
    </CphPdfViewerPrefsProvider>,
  );
  return { shell: container.querySelector(".cph-pdf-viewer__shell") };
}

beforeEach(() => {
  mocks.stageState = createMockStageState();
});

describe("CphPdfThemeToggle", () => {
  it("labels itself with the theme it switches to (light → dark)", () => {
    renderToggle();
    expect(screen.getByRole("button", { name: "Use dark theme" })).toBeInTheDocument();
  });

  it("toggles data-theme on the shell and updates the label", async () => {
    const user = userEvent.setup();
    const { shell } = renderToggle();
    expect(shell).toHaveAttribute("data-theme", "light");

    await user.click(screen.getByRole("button", { name: "Use dark theme" }));
    expect(shell).toHaveAttribute("data-theme", "dark");
    expect(screen.getByRole("button", { name: "Use light theme" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Use light theme" }));
    expect(shell).toHaveAttribute("data-theme", "light");
  });

  it("lets a controlled theme prop win and reports changes", async () => {
    const user = userEvent.setup();
    const onThemeChange = vi.fn();
    const { shell } = renderToggle({ theme: "dark", onThemeChange });
    expect(shell).toHaveAttribute("data-theme", "dark");
    expect(screen.getByRole("button", { name: "Use light theme" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Use light theme" }));
    expect(onThemeChange).toHaveBeenCalledWith("light");
    expect(shell).toHaveAttribute("data-theme", "dark"); // controlled: unchanged
  });
});
