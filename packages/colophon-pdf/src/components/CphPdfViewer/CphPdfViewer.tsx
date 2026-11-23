import {
  DocumentScope,
  Viewer,
  annotationPlugin,
  interactionPlugin,
  isCancelled,
  outlinePlugin,
  renderPlugin,
  searchPlugin,
  selectionPlugin,
  stagePlugin,
  useDocuments,
  type AnyPlugin,
  type DocumentsCapability,
  type Engine,
  type EngineFactory,
} from "@embedpdf/react";
import { CphButton } from "@nickrobison/colophon";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { CphPdfContext, type CphPdfViewerStatus } from "../../pdf/context";
import { createCphPdfEngine } from "../../pdf/engine";
import { CphPdfPageStateProvider } from "../../pdf/pageState";
import { toCphPdfOpenSource, type CphPdfDocumentSource } from "../../pdf/source";
import { CphPdfViewerPrefsProvider } from "../../pdf/viewerPrefs";
import type { CphPdfDensityPreset, CphPdfTheme } from "../../pdf/viewerPrefsContext";

export interface CphPdfViewerProps {
  /** The document to open: a URL or the PDF bytes. */
  source: CphPdfDocumentSource;
  /**
   * EmbedPDF engine instance or factory. Defaults to a zero-config local
   * engine created with {@link createCphPdfEngine}.
   */
  engine?: Engine | EngineFactory;
  /**
   * Replaces the default plugin set (stage, render, selection, interaction,
   * search, outline, annotation) with your own — opt out of heavy plugins like
   * annotation, or add link/stamp. Omit to keep the defaults.
   */
  plugins?: AnyPlugin[];
  /** Called once the document is open and children can render. */
  onReady?: (documents: DocumentsCapability) => void;
  /** Called when the document cannot be opened. */
  onError?: (error: Error) => void;
  /**
   * Controlled current page (1-based), paired with {@link CphPdfViewerProps.onPageChange}.
   * Omit for the uncontrolled default, where the stage (scrolling) owns the page.
   */
  page?: number;
  /** Controlled: fired with the new page whenever the stage's page changes. */
  onPageChange?: (page: number) => void;
  /**
   * Controlled density (`"comfortable" | "compact" | "dense"`), applied as
   * `data-density` on the viewer shell. Omit for the uncontrolled default.
   */
  density?: CphPdfDensityPreset;
  /** Controlled: fired with the new density when the user changes it. */
  onDensityChange?: (density: CphPdfDensityPreset) => void;
  /** Controlled theme (`"light" | "dark"`), applied as `data-theme`. */
  theme?: CphPdfTheme;
  /** Controlled: fired with the new theme when the user toggles it. */
  onThemeChange?: (theme: CphPdfTheme) => void;
  /** Zoom floor (factor) below which zoom-out is disabled. Default `0.75`. */
  minZoom?: number;
  /** Zoom ceiling (factor) at which zoom-in is disabled. Default `1.5`. */
  maxZoom?: number;
  /**
   * Document-scoped UI (`CphPdfStage`, `CphPdfPageNav`, …). Mounted only while
   * the document is ready, under a `DocumentScope` and the page-state provider.
   */
  children?: ReactNode;
  className?: string;
}

// The error case is deliberately absent: failures are announced by the
// dedicated role="alert" block, so the polite live region keeps whatever it was
// saying instead of double-announcing alongside the alert.
const STATUS_TEXT: Record<Exclude<CphPdfViewerStatus, "error">, string> = {
  loading: "Opening document…",
  ready: "Document ready.",
};

function statusText(status: CphPdfViewerStatus): string {
  return status === "error" ? STATUS_TEXT.loading : STATUS_TEXT[status];
}

function createDefaultPlugins(): AnyPlugin[] {
  return [
    interactionPlugin(),
    stagePlugin(),
    renderPlugin(),
    selectionPlugin(),
    searchPlugin(),
    outlinePlugin(),
    annotationPlugin(),
  ];
}

function toError(cause: unknown): Error {
  if (cause instanceof Error) return cause;
  if (typeof cause === "object" && cause !== null && "message" in cause) {
    return new Error(String((cause as { message: unknown }).message));
  }
  return new Error(String(cause));
}

interface CphPdfDocumentHostProps {
  source: CphPdfDocumentSource;
  onReady?: (documents: DocumentsCapability) => void;
  onError?: (error: Error) => void;
  page?: number;
  onPageChange?: (page: number) => void;
  density?: CphPdfDensityPreset;
  onDensityChange?: (density: CphPdfDensityPreset) => void;
  theme?: CphPdfTheme;
  onThemeChange?: (theme: CphPdfTheme) => void;
  minZoom?: number;
  maxZoom?: number;
  children?: ReactNode;
  className?: string;
}

/**
 * Opens the source through EmbedPDF's document registry and publishes the
 * lifecycle to the Colophon context. Rendered inside `<Viewer>` so the
 * registry exists.
 */
function CphPdfDocumentHost({
  source,
  onReady,
  onError,
  page,
  onPageChange,
  density,
  onDensityChange,
  theme,
  onThemeChange,
  minZoom,
  maxZoom,
  children,
  className,
}: CphPdfDocumentHostProps) {
  const documents = useDocuments();
  const [status, setStatus] = useState<CphPdfViewerStatus>("loading");
  const [error, setError] = useState<Error | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);

  // Latest callbacks without re-running the open when they change identity.
  const callbacks = useRef({ onReady, onError });
  useEffect(() => {
    callbacks.current = { onReady, onError };
  });

  // In-flight open, so a retry or a source change cancels the previous one.
  const inflight = useRef<AbortController | null>(null);
  // The document id this viewer currently owns once ready. Mirrors state but is
  // read inside `open`, where reading render-time state would re-run the effect.
  const readyDocumentId = useRef<string | null>(null);

  const open = useCallback(async () => {
    inflight.current?.abort();
    const controller = new AbortController();
    inflight.current = controller;

    setStatus("loading");
    setError(null);
    setDocumentId(null);

    // A source change replaces the document: release the previously opened one
    // so resources don't accumulate while the viewer stays mounted. Retry and
    // mount paths have nothing to close (the ref was cleared on success/fail).
    // Best-effort: children had access to that id and may have closed it first.
    const closingId = readyDocumentId.current;
    readyDocumentId.current = null;
    if (closingId) void documents.close(closingId).catch(() => {});

    const before = new Set(documents.getOrder());
    const fail = (cause: unknown) => {
      if (controller.signal.aborted) return;
      const next = toError(cause);
      setDocumentId(null);
      setError(next);
      setStatus("error");
      callbacks.current.onError?.(next);
    };

    try {
      const { document } = await documents.open(toCphPdfOpenSource(source), {
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      if (document.status === "ready") {
        setDocumentId(document.id);
        readyDocumentId.current = document.id;
        setStatus("ready");
        callbacks.current.onReady?.(documents);
        return;
      }
      if (document.status === "locked") {
        // Not a failure to close: password entry lands in a later release, and
        // closing keeps a retry from stacking tabs on the same source.
        void documents.close(document.id);
        fail(
          new Error(
            "This document is password-protected. Password entry lands in a later Colophon PDF release.",
          ),
        );
        return;
      }
      void documents.close(document.id);
      fail(new Error(document.error?.message ?? "The document could not be opened."));
    } catch (cause) {
      if (controller.signal.aborted || isCancelled(cause)) return;
      // Drop the failed tab so a retry starts clean instead of stacking errors.
      const failedId = documents.getOrder().find((id) => !before.has(id));
      if (failedId) void documents.close(failedId);
      fail(cause);
    }
  }, [documents, source]);

  // Defer the first open off the synchronous effect body so state only ever
  // changes from async completions (or the retry event handler).
  useEffect(() => {
    const timer = setTimeout(() => {
      void open();
    }, 0);
    return () => {
      clearTimeout(timer);
      inflight.current?.abort();
    };
  }, [open]);

  // `open` resets to loading when it starts, so retry (an event handler,
  // not an effect) only has to kick off a fresh attempt.
  const retry = useCallback(() => {
    void open();
  }, [open]);

  const contextValue = useMemo(
    () => ({ documents, documentId, status, error, retry }),
    [documents, documentId, status, error, retry],
  );

  return (
    <div className={["cph-pdf-viewer", className].filter(Boolean).join(" ")}>
      <p
        className={[
          "cph-pdf-viewer__status",
          status === "ready" ? "cph-pdf-viewer__status--ready" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        role="status"
        aria-live="polite"
      >
        {statusText(status)}
      </p>
      {status === "error" ? (
        <div className="cph-pdf-viewer__error" role="alert">
          <p className="cph-pdf-viewer__error-message">
            {error?.message ?? "The document could not be opened."}
          </p>
          <CphButton variant="secondary" onPress={retry}>
            Try again
          </CphButton>
        </div>
      ) : null}
      {status === "ready" && documentId ? (
        <CphPdfContext.Provider value={contextValue}>
          <DocumentScope id={documentId}>
            <CphPdfPageStateProvider
              {...(page === undefined ? {} : { page })}
              {...(onPageChange === undefined ? {} : { onPageChange })}
            >
              <CphPdfViewerPrefsProvider
                {...(density === undefined ? {} : { density })}
                {...(onDensityChange === undefined ? {} : { onDensityChange })}
                {...(theme === undefined ? {} : { theme })}
                {...(onThemeChange === undefined ? {} : { onThemeChange })}
                {...(minZoom === undefined ? {} : { minZoom })}
                {...(maxZoom === undefined ? {} : { maxZoom })}
              >
                {children}
              </CphPdfViewerPrefsProvider>
            </CphPdfPageStateProvider>
          </DocumentScope>
        </CphPdfContext.Provider>
      ) : null}
    </div>
  );
}

function CphPdfBootError({ cause }: { cause: unknown }) {
  return (
    <div className="cph-pdf-viewer__error" role="alert">
      <p className="cph-pdf-viewer__error-message">
        The PDF viewer could not start: {toError(cause).message}
      </p>
    </div>
  );
}

/**
 * Root of the Colophon PDF stack: owns the EmbedPDF engine and plugin set,
 * opens one document, and publishes loading/ready/error to {@link usePdfViewer}.
 */
export function CphPdfViewer({
  source,
  engine,
  plugins,
  onReady,
  onError,
  page,
  onPageChange,
  density,
  onDensityChange,
  theme,
  onThemeChange,
  minZoom,
  maxZoom,
  children,
  className,
}: CphPdfViewerProps) {
  const defaultPlugins = useMemo(() => createDefaultPlugins(), []);
  const activePlugins = plugins ?? defaultPlugins;
  const engineValue = useMemo<Engine | EngineFactory>(
    () => engine ?? createCphPdfEngine(),
    [engine],
  );

  return (
    <Viewer
      engine={engineValue}
      plugins={activePlugins}
      renderError={(cause) => <CphPdfBootError cause={cause} />}
    >
      <CphPdfDocumentHost
        source={source}
        {...(onReady === undefined ? {} : { onReady })}
        {...(onError === undefined ? {} : { onError })}
        {...(page === undefined ? {} : { page })}
        {...(onPageChange === undefined ? {} : { onPageChange })}
        {...(density === undefined ? {} : { density })}
        {...(onDensityChange === undefined ? {} : { onDensityChange })}
        {...(theme === undefined ? {} : { theme })}
        {...(onThemeChange === undefined ? {} : { onThemeChange })}
        {...(minZoom === undefined ? {} : { minZoom })}
        {...(maxZoom === undefined ? {} : { maxZoom })}
        {...(className === undefined ? {} : { className })}
      >
        {children}
      </CphPdfDocumentHost>
    </Viewer>
  );
}
