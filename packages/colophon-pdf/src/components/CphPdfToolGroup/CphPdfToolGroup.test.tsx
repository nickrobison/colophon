import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CphPdfViewerPrefsProvider } from "../../pdf/viewerPrefs";
import { CphPdfToolGroup } from "./CphPdfToolGroup";

const mocks = vi.hoisted(() => {
  const interaction = {
    hasTool: vi.fn(() => true),
    registerTool: vi.fn(() => () => {}),
    activateTool: vi.fn(),
    getActiveToolId: vi.fn(() => "pointer"),
  };
  return {
    interaction,
    interactionState: { activeToolId: "pointer" as string | null, tools: [] as unknown[] },
    stageState: {
      zoomLevel: 1,
      zoomMode: "custom",
      currentPageIndex: 0,
      currentPage: null,
      pageCount: 3,
      viewRotation: 0,
      activeRules: [],
    },
  };
});

vi.mock("@embedpdf/react", () => ({
  useStage: () => ({ zoomIn: vi.fn(), zoomOut: vi.fn(), zoomBy: vi.fn() }),
  useStageState: (select?: (state: unknown) => unknown) =>
    select ? select(mocks.stageState) : mocks.stageState,
  useInteraction: () => mocks.interaction,
  useInteractionState: (select?: (state: unknown) => unknown) =>
    select ? select(mocks.interactionState) : mocks.interactionState,
}));

function GroupTree(props: Parameters<typeof CphPdfToolGroup>[0] = {}) {
  return (
    <CphPdfViewerPrefsProvider>
      <CphPdfToolGroup {...props} />
    </CphPdfViewerPrefsProvider>
  );
}

function renderGroup(props: Parameters<typeof CphPdfToolGroup>[0] = {}) {
  return render(<GroupTree {...props} />);
}

beforeEach(() => {
  mocks.interactionState.activeToolId = "pointer";
  mocks.interaction.activateTool.mockClear();
  mocks.interaction.getActiveToolId.mockClear();
  mocks.interaction.getActiveToolId.mockReturnValue("pointer");
});

describe("CphPdfToolGroup", () => {
  it("renders Read/Highlight/Comment as a single-select radio group with Read selected", () => {
    renderGroup();
    expect(screen.getByRole("radiogroup", { name: "Tools" })).toBeInTheDocument();

    const read = screen.getByRole("radio", { name: "Read" });
    expect(read).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Highlight" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
    expect(screen.getByRole("radio", { name: "Comment" })).toHaveAttribute("aria-checked", "false");
  });

  it("is single-select: pressing Highlight deactivates Read", async () => {
    const user = userEvent.setup();
    const { rerender } = renderGroup();

    await user.click(screen.getByRole("radio", { name: "Highlight" }));
    expect(mocks.interaction.activateTool).toHaveBeenCalledWith("highlight");

    mocks.interactionState.activeToolId = "highlight";
    rerender(<GroupTree />);
    expect(screen.getByRole("radio", { name: "Highlight" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: "Read" })).toHaveAttribute("aria-checked", "false");
  });

  it("moves focus with the arrow keys and activates with Enter (RAC roving tabindex)", async () => {
    const user = userEvent.setup();
    renderGroup();

    await user.click(screen.getByRole("radio", { name: "Read" }));
    await user.keyboard("{ArrowRight}");
    await user.keyboard("{Enter}");

    expect(mocks.interaction.activateTool).toHaveBeenCalledWith("highlight");
  });

  it("lets a controlled tool prop win and reports changes through onToolChange", async () => {
    const user = userEvent.setup();
    const onToolChange = vi.fn();
    const { rerender } = renderGroup({ tool: "comment", onToolChange });

    expect(screen.getByRole("radio", { name: "Comment" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Read" })).toHaveAttribute("aria-checked", "false");

    await user.click(screen.getByRole("radio", { name: "Highlight" }));
    expect(onToolChange).toHaveBeenCalledWith("highlight");
    expect(mocks.interaction.activateTool).toHaveBeenCalledWith("highlight");

    rerender(<GroupTree tool="comment" onToolChange={onToolChange} />);
    // Controlled: the prop still wins over the (un-mirrored) context.
    expect(screen.getByRole("radio", { name: "Comment" })).toHaveAttribute("aria-checked", "true");
  });

  it("exposes custom labels when provided", () => {
    renderGroup({ labels: { read: "Browse" } });
    expect(screen.getByRole("radio", { name: "Browse" })).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "Read" })).not.toBeInTheDocument();
  });
});
