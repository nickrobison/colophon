import { localEngine, type LocalEngineRecipeOptions } from "@embedpdf/engine";

/**
 * Engine options Colophon exposes. Deliberately narrower than EmbedPDF's full
 * recipe: these are the knobs a consumer needs to self-host assets or run the
 * engine in a custom worker. Everything else uses EmbedPDF's zero-config
 * defaults (bundler-emitted worker + WASM, in-thread PDFium in Node).
 */
export interface CphPdfEngineConfig {
  /** Base directory for self-hosted runtime assets; `embedpdf.wasm` is appended. */
  assetsUrl?: string;
  /** The worker backing the engine: `"inline"`, a URL, a `Worker`, or a thunk. */
  worker?: LocalEngineRecipeOptions["worker"];
  /** The image-encoder worker pool's delivery; `false` encodes on the main thread. */
  encoderWorker?: LocalEngineRecipeOptions["encoderWorker"];
  /** Fonts appended to the glyph-fallback chain, in order. */
  fallbackFonts?: LocalEngineRecipeOptions["fallbackFonts"];
  /** Node/test runtime preference (`{ prefer: "wasm" }`). Ignored where a worker runs. */
  runtime?: LocalEngineRecipeOptions["runtime"];
  /** Worker queue concurrency (default 1). */
  concurrency?: number;
}

/**
 * Creates the local EmbedPDF engine used by {@link CphPdfViewer}.
 *
 * Construction is synchronous and inert: no worker or WASM is allocated until
 * the first document operation. Pass the result to `CphPdfViewer` as `engine`,
 * or use the default the viewer creates for you.
 */
export function createCphPdfEngine(config: CphPdfEngineConfig = {}) {
  return localEngine({
    ...(config.assetsUrl === undefined ? {} : { assetsUrl: config.assetsUrl }),
    ...(config.worker === undefined ? {} : { worker: config.worker }),
    ...(config.encoderWorker === undefined ? {} : { encoderWorker: config.encoderWorker }),
    ...(config.fallbackFonts === undefined ? {} : { fallbackFonts: config.fallbackFonts }),
    ...(config.runtime === undefined ? {} : { runtime: config.runtime }),
    ...(config.concurrency === undefined ? {} : { concurrency: config.concurrency }),
  });
}
