import type { OpenSource } from "@embedpdf/react";

/** Lazily resolves a document source; the signal aborts when the open is cancelled. */
export type CphPdfDocumentLoader = (
  signal: AbortSignal,
) => CphPdfDocumentSource | Promise<CphPdfDocumentSource>;

/** Document source accepted by the viewer: remote URL, local URL, bytes, or a loader. */
export type CphPdfDocumentSource = string | URL | Uint8Array | CphPdfDocumentLoader;

/** The non-loader half of {@link CphPdfDocumentSource}. */
export type CphPdfResolvedSource = string | URL | Uint8Array;

/** `OpenSource` minus its loader branch. */
type CphPdfOpenInput = Extract<OpenSource, { kind: string }>;

function toOpenInput(source: CphPdfResolvedSource): CphPdfOpenInput {
  if (typeof source === "string") {
    return { kind: "url", url: source };
  }
  if (source instanceof URL) {
    return { kind: "url", url: source.toString() };
  }
  return { kind: "bytes", bytes: source };
}

async function resolveSource(
  source: CphPdfDocumentSource,
  signal: AbortSignal,
): Promise<CphPdfOpenInput> {
  if (typeof source === "function") {
    return resolveSource(await source(signal), signal);
  }
  return toOpenInput(source);
}

/**
 * Maps a Colophon document source onto EmbedPDF's `OpenSource` union.
 *
 * URLs are handed to the viewer's own `fetch`; bytes are passed through without
 * copying, so the caller keeps ownership of the buffer. Loaders are wrapped so
 * they keep EmbedPDF's cancellation signal.
 */
export function toCphPdfOpenSource(source: CphPdfDocumentSource): OpenSource {
  if (typeof source === "function") {
    return (signal) => resolveSource(source, signal);
  }
  return toOpenInput(source);
}
