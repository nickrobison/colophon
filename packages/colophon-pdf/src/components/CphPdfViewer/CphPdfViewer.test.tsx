import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Component, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePdfViewer } from "../../pdf/context";
import { usePdfPageState } from "../../pdf/pageStateContext";
import { createMockStageState, type MockStageState } from "../../test/mockViewer";
import { CphPdfViewer } from "./CphPdfViewer";

const mocks = vi.hoisted(() => {
  const open = vi.fn();
  return {
    open,
    documents: {
      open,
      getOrder: vi.fn(() => [] as string[]),
      close: vi.fn(async () => undefined),
    },
    // Assigned a fresh object by `beforeEach` before any test renders.
    stageState: null as unknown as MockStageState,
    goToPage: vi.fn<(index: number) => void>(),
    interaction: {
      hasTool: vi.fn(() => true),
      registerTool: vi.fn(() => () => {}),
      activateTool: vi.fn(),
      getActiveToolId: vi.fn(() => "pointer"),
    },
    interactionState: { activeToolId: "pointer" as string | null, tools: [] as unknown[] },
  };
});

vi.mock("@embedpdf/react", () => ({
  Viewer: ({ children }: { children?: ReactNode }) => children,
  useDocuments: () => mocks.documents,
  DocumentScope: ({ children }: { children?: ReactNode }) => children,
  isCancelled: () => false,
  useStage: () => ({
    goToPage: mocks.goToPage,
    getCurrentPageIndex: () => mocks.stageState?.currentPageIndex ?? 0,
    zoomIn: vi.fn(),
    zoomOut: vi.fn(),
    zoomBy: vi.fn(),
  }),
  useStageState: (select?: (state: unknown) => unknown) =>
    select ? select(mocks.stageState) : mocks.stageState,
  useInteraction: () => mocks.interaction,
  useInteractionState: (select?: (state: unknown) => unknown) =>
    select ? select(mocks.interactionState) : mocks.interactionState,
  interactionPlugin: () => ({}),
  stagePlugin: () => ({}),
  renderPlugin: () => ({}),
  selectionPlugin: () => ({}),
  searchPlugin: () => ({}),
  outlinePlugin: () => ({}),
  annotationPlugin: () => ({}),
}));

const readyDocument = {
  id: "doc-1",
  name: "basic.pdf",
  status: "ready" as const,
  pageCount: 3,
  hasUnsavedChanges: false,
};

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    return this.state.error ? <p>{this.state.error.message}</p> : this.props.children;
  }
}

function HookProbe() {
  usePdfViewer();
  return null;
}

function PageProbe() {
  const { page } = usePdfPageState();
  return <p data-testid="viewer-page">page {page}</p>;
}

describe("CphPdfViewer", () => {
  beforeEach(() => {
    mocks.open.mockReset();
    mocks.documents.getOrder.mockReset();
    mocks.documents.getOrder.mockReturnValue([]);
    mocks.documents.close.mockReset();
    mocks.goToPage.mockReset();
    mocks.stageState = createMockStageState();
    mocks.interactionState.activeToolId = "pointer";
    mocks.interaction.activateTool.mockClear();
  });

  it("announces loading while the document opens", () => {
    mocks.open.mockReturnValue(new Promise(() => {}));

    render(<CphPdfViewer source="/docs/basic.pdf" />);

    expect(screen.getByRole("status")).toHaveTextContent("Opening document…");
  });

  it("renders children once the document is ready", async () => {
    mocks.open.mockResolvedValue({ document: readyDocument });

    render(
      <CphPdfViewer source="/docs/basic.pdf">
        <p>document body</p>
      </CphPdfViewer>,
    );

    expect(await screen.findByText("document body")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Document ready.");
  });

  it("shows the failure and retries the open", async () => {
    mocks.open.mockRejectedValueOnce(new Error("fixture is corrupt"));
    mocks.open.mockResolvedValueOnce({ document: readyDocument });
    const user = userEvent.setup();

    render(
      <CphPdfViewer source="/docs/basic.pdf">
        <p>document body</p>
      </CphPdfViewer>,
    );

    expect(await screen.findByRole("alert")).toHaveTextContent("fixture is corrupt");
    expect(mocks.open).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("document body")).toBeInTheDocument();
    expect(mocks.open).toHaveBeenCalledTimes(2);
  });

  it("reports open failures through onError", async () => {
    const onError = vi.fn();
    mocks.open.mockRejectedValueOnce(new Error("nope"));

    render(<CphPdfViewer source="/docs/basic.pdf" onError={onError} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("nope");
    expect(onError).toHaveBeenCalledWith(expect.objectContaining({ message: "nope" }));
    // The failure is announced once, by the alert — the polite status region
    // must not change its text, or screen readers would double-announce.
    expect(screen.getByRole("status")).toHaveTextContent("Opening document…");
  });

  it("closes the previous document and returns to loading when the source changes", async () => {
    mocks.open
      .mockResolvedValueOnce({ document: readyDocument })
      // The swapped-in source keeps loading so we can observe the transition.
      .mockReturnValueOnce(new Promise(() => {}));

    const { rerender } = render(<CphPdfViewer source="/docs/a.pdf" />);
    await screen.findByText("Document ready.");
    expect(mocks.documents.close).not.toHaveBeenCalled();

    rerender(<CphPdfViewer source="/docs/b.pdf" />);

    await waitFor(() => expect(mocks.documents.close).toHaveBeenCalledWith("doc-1"));
    expect(screen.getByRole("status")).toHaveTextContent("Opening document…");
    expect(screen.queryByText("Document ready.")).not.toBeInTheDocument();
  });

  it("throws when usePdfViewer is called outside a viewer", () => {
    render(
      <ErrorBoundary>
        <HookProbe />
      </ErrorBoundary>,
    );

    expect(
      screen.getByText("usePdfViewer must be used inside <CphPdfViewer>."),
    ).toBeInTheDocument();
  });

  it("passes URL sources through as URL opens", async () => {
    mocks.open.mockResolvedValue({ document: readyDocument });

    render(<CphPdfViewer source="/docs/basic.pdf" />);
    await screen.findByText("Document ready.");

    expect(mocks.open).toHaveBeenLastCalledWith(
      { kind: "url", url: "/docs/basic.pdf" },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it("passes URL objects through as URL opens", async () => {
    mocks.open.mockResolvedValue({ document: readyDocument });

    render(<CphPdfViewer source={new URL("https://example.com/basic.pdf")} />);
    await screen.findByText("Document ready.");

    expect(mocks.open).toHaveBeenLastCalledWith(
      { kind: "url", url: "https://example.com/basic.pdf" },
      expect.anything(),
    );
  });

  it("passes byte sources through untouched", async () => {
    const bytes = new Uint8Array([37, 80, 68, 70]);
    mocks.open.mockResolvedValue({ document: readyDocument });

    render(<CphPdfViewer source={bytes} />);
    await screen.findByText("Document ready.");

    expect(mocks.open).toHaveBeenLastCalledWith({ kind: "bytes", bytes }, expect.anything());
  });

  it("resolves loader sources with the open signal", async () => {
    mocks.open.mockResolvedValue({ document: readyDocument });
    const loader = vi.fn(() => "/docs/lazy.pdf");

    render(<CphPdfViewer source={loader} />);
    await screen.findByText("Document ready.");

    const [openSource, options] = mocks.open.mock.calls.at(-1) ?? [];
    expect(typeof openSource).toBe("function");
    const resolved = await openSource(options.signal);
    expect(loader).toHaveBeenCalledWith(options.signal);
    expect(resolved).toEqual({ kind: "url", url: "/docs/lazy.pdf" });
  });

  it("threads the controlled page prop through to the stage and reports changes back", async () => {
    mocks.open.mockResolvedValue({ document: readyDocument });
    const onPageChange = vi.fn();

    const tree = (page: number) => (
      <CphPdfViewer source="/docs/basic.pdf" page={page} onPageChange={onPageChange}>
        <PageProbe />
      </CphPdfViewer>
    );

    const { rerender } = render(tree(2));
    expect(await screen.findByTestId("viewer-page")).toHaveTextContent("page 2");
    // Controlled mount: the viewer moved the stage to page 2 (index 1).
    await waitFor(() => expect(mocks.goToPage).toHaveBeenCalledWith(1));

    // The stage moves on its own (scroll/wheel in real life) to page 3; the
    // owner must hear about it through onPageChange.
    mocks.stageState = createMockStageState({ currentPageIndex: 2 });
    rerender(tree(2));

    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("threads density/theme props to the viewer shell", async () => {
    mocks.open.mockResolvedValue({ document: readyDocument });

    render(
      <CphPdfViewer source="/docs/basic.pdf" density="compact" theme="dark">
        <p>document body</p>
      </CphPdfViewer>,
    );
    await screen.findByText("document body");

    const shell = document.querySelector(".cph-pdf-viewer__shell");
    expect(shell).not.toBeNull();
    expect(shell).toHaveAttribute("data-density", "compact");
    expect(shell).toHaveAttribute("data-theme", "dark");
  });
});
