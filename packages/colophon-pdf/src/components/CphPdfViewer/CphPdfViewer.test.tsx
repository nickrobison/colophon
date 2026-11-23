import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Component, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePdfViewer } from "../../pdf/context";
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
  };
});

vi.mock("@embedpdf/react", () => ({
  Viewer: ({ children }: { children?: ReactNode }) => children,
  useDocuments: () => mocks.documents,
  isCancelled: () => false,
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

describe("CphPdfViewer", () => {
  beforeEach(() => {
    mocks.open.mockReset();
    mocks.documents.getOrder.mockReset();
    mocks.documents.getOrder.mockReturnValue([]);
    mocks.documents.close.mockReset();
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
});
