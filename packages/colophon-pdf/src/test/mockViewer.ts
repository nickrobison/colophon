import type { DocumentsCapability, DocumentInfo } from "@embedpdf/react";
import { vi, type Mock } from "vitest";

/** Maps every function member of `T` to a `vi.fn()` with the same signature. */
export type Mocked<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R ? Mock<(...args: A) => R> : T[K];
};

export type MockDocumentsCapability = Mocked<DocumentsCapability>;

/** Minimal stage stand-in for plans 03+ (zoom, camera, page position). */
export interface MockStageCapability {
  getZoomLevel: Mock<() => number>;
  zoomTo: Mock<(level: number) => void>;
  zoomBy: Mock<(factor: number) => void>;
  zoomIn: Mock<() => void>;
  zoomOut: Mock<() => void>;
  fitWidth: Mock<() => void>;
  fitPage: Mock<() => void>;
  getCurrentPageIndex: Mock<() => number>;
  getPageCount: Mock<() => number>;
  setCamera: Mock<(camera: unknown) => void>;
}

/** Minimal search stand-in for plan 05. */
export interface MockSearchCapability {
  findAll: Mock<(query: string) => Promise<unknown>>;
  findNext: Mock<() => void>;
  findPrevious: Mock<() => void>;
  clear: Mock<() => void>;
  getActiveHit: Mock<() => unknown>;
}

/** Minimal annotation stand-in for plans 08–09. */
export interface MockAnnotationCapability {
  createFromSelection: Mock<(kind: string, options?: unknown) => Promise<unknown>>;
  list: Mock<() => readonly unknown[]>;
  delete: Mock<(id: string) => Promise<void>>;
  buildCommentThreads: Mock<(annotations: readonly unknown[]) => readonly unknown[]>;
}

/** Minimal outline stand-in for plan 06. */
export interface MockOutlineCapability {
  get: Mock<() => Promise<unknown>>;
  getState: Mock<() => unknown>;
}

/** Minimal interaction stand-in for plan 04. */
export interface MockInteractionCapability {
  setTool: Mock<(tool: string) => void>;
  getTool: Mock<() => string>;
}

export interface MockPdfViewer {
  documents: MockDocumentsCapability;
  stage: MockStageCapability;
  search: MockSearchCapability;
  annotation: MockAnnotationCapability;
  outline: MockOutlineCapability;
  interaction: MockInteractionCapability;
}

export interface CreateMockViewerOptions {
  /** Fields merged over the default ready 3-page document. */
  document?: Partial<DocumentInfo>;
}

/** A `StageState`-shaped object for mocks of `useStageState` (plan 03+). */
export interface MockStageState {
  zoomLevel: number;
  zoomMode: string;
  currentPageIndex: number;
  currentPage: unknown;
  pageCount: number;
  viewRotation: number;
  activeRules: readonly string[];
}

/** Defaults to a ready 3-page document on page 1. */
export function createMockStageState(overrides: Partial<MockStageState> = {}): MockStageState {
  return {
    zoomLevel: 1,
    zoomMode: "custom",
    currentPageIndex: 0,
    currentPage: null,
    pageCount: 3,
    viewRotation: 0,
    activeRules: [],
    ...overrides,
  };
}

const eventHook = () => vi.fn<() => () => void>(() => () => {});

function createMockDocuments(document: DocumentInfo): MockDocumentsCapability {
  return {
    open: vi.fn<DocumentsCapability["open"]>(async () => ({ document })),
    retry: vi.fn<DocumentsCapability["retry"]>(async () => ({ document })),
    identify: vi.fn<DocumentsCapability["identify"]>(async () => undefined),
    declineIdentity: vi.fn<DocumentsCapability["declineIdentity"]>(() => undefined),
    rename: vi.fn<DocumentsCapability["rename"]>(() => undefined),
    openAll: vi.fn<DocumentsCapability["openAll"]>(() => [document.id]),
    unlock: vi.fn<DocumentsCapability["unlock"]>(async () => undefined),
    close: vi.fn<DocumentsCapability["close"]>(async () => undefined),
    closeAll: vi.fn<DocumentsCapability["closeAll"]>(async () => undefined),
    setActive: vi.fn<DocumentsCapability["setActive"]>(() => undefined),
    getActiveId: vi.fn<DocumentsCapability["getActiveId"]>(() => document.id),
    getActive: vi.fn<DocumentsCapability["getActive"]>(() => document),
    list: vi.fn<DocumentsCapability["list"]>(() => [document]),
    get: vi.fn<DocumentsCapability["get"]>(() => document),
    has: vi.fn<DocumentsCapability["has"]>(() => true),
    getCount: vi.fn<DocumentsCapability["getCount"]>(() => 1),
    getOrder: vi.fn<DocumentsCapability["getOrder"]>(() => [document.id]),
    setOrder: vi.fn<DocumentsCapability["setOrder"]>(() => undefined),
    move: vi.fn<DocumentsCapability["move"]>(() => undefined),
    swap: vi.fn<DocumentsCapability["swap"]>(() => undefined),
    download: vi.fn<DocumentsCapability["download"]>(async () => new Uint8Array()),
    downloadLayer: vi.fn<DocumentsCapability["downloadLayer"]>(async () => new Uint8Array()),
    canDownload: vi.fn<DocumentsCapability["canDownload"]>(() => true),
    preparePrint: vi.fn<DocumentsCapability["preparePrint"]>(async () => ({}) as never),
    print: vi.fn<DocumentsCapability["print"]>(async () => undefined),
    getPrintQuality: vi.fn<DocumentsCapability["getPrintQuality"]>(() => null),
    canPrint: vi.fn<DocumentsCapability["canPrint"]>(() => false),
    canOpenFiles: vi.fn<DocumentsCapability["canOpenFiles"]>(() => true),
    listPages: vi.fn<DocumentsCapability["listPages"]>(() => []),
    getPage: vi.fn<DocumentsCapability["getPage"]>(() => null),
    getPageIndex: vi.fn<DocumentsCapability["getPageIndex"]>(() => -1),
    getRevision: vi.fn<DocumentsCapability["getRevision"]>(() => 0),
    onOpened: eventHook(),
    onOpenFailed: eventHook(),
    onLocked: eventHook(),
    onClosed: eventHook(),
    onActiveChanged: eventHook(),
    onPagesChanged: eventHook(),
    onUnsavedChangesChanged: eventHook(),
  } as MockDocumentsCapability;
}

/**
 * Fake EmbedPDF viewer for unit tests. Never imports the real engine; every
 * method is a `vi.fn()` with a benign default so tests only override what they
 * assert on.
 */
export function createMockViewer(options: CreateMockViewerOptions = {}): MockPdfViewer {
  const document: DocumentInfo = {
    id: "doc-1",
    name: "mock.pdf",
    status: "ready",
    pageCount: 3,
    hasUnsavedChanges: false,
    ...options.document,
  };

  return {
    documents: createMockDocuments(document),
    stage: {
      getZoomLevel: vi.fn<() => number>(() => 1),
      zoomTo: vi.fn<(level: number) => void>(() => undefined),
      zoomBy: vi.fn<(factor: number) => void>(() => undefined),
      zoomIn: vi.fn<() => void>(() => undefined),
      zoomOut: vi.fn<() => void>(() => undefined),
      fitWidth: vi.fn<() => void>(() => undefined),
      fitPage: vi.fn<() => void>(() => undefined),
      getCurrentPageIndex: vi.fn<() => number>(() => 0),
      getPageCount: vi.fn<() => number>(() => document.pageCount),
      setCamera: vi.fn<(camera: unknown) => void>(() => undefined),
    },
    search: {
      findAll: vi.fn<(query: string) => Promise<unknown>>(async () => ({})),
      findNext: vi.fn<() => void>(() => undefined),
      findPrevious: vi.fn<() => void>(() => undefined),
      clear: vi.fn<() => void>(() => undefined),
      getActiveHit: vi.fn<() => unknown>(() => null),
    },
    annotation: {
      createFromSelection: vi.fn<(kind: string, options?: unknown) => Promise<unknown>>(
        async () => ({}),
      ),
      list: vi.fn<() => readonly unknown[]>(() => []),
      delete: vi.fn<(id: string) => Promise<void>>(async () => undefined),
      buildCommentThreads: vi.fn<(annotations: readonly unknown[]) => readonly unknown[]>(() => []),
    },
    outline: {
      get: vi.fn<() => Promise<unknown>>(async () => ({ items: [] })),
      getState: vi.fn<() => unknown>(() => ({})),
    },
    interaction: {
      setTool: vi.fn<(tool: string) => void>(() => undefined),
      getTool: vi.fn<() => string>(() => "read"),
    },
  };
}
