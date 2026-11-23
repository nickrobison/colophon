// Generates the committed PDF fixtures for @nickrobison/colophon-pdf.
//
// Deterministic by design: no creation/modification dates are written and the
// output is byte-identical across runs, so `git diff --stat` stays clean after
// re-running. Content mirrors the Kepler "Document studio" prototype.
//
// Usage: node fixtures/generate-fixtures.mjs

import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFHexString,
  PDFName,
  PDFNull,
  StandardFonts,
  rgb,
} from "pdf-lib";

const PAGES = [
  {
    kicker: "I · On the architecture of inquiry",
    title: "Knowledge does not arrive alone.",
    paragraphs: [
      "Every source enters an existing field of questions. Its meaning is shaped not only by what it says, but by the claims it supports, the terms it inherits, and the arguments it quietly refuses.",
      "A useful knowledge system therefore preserves context before it produces connection. The graph is not an illustration laid over the archive. It is a record of the scholar's decisions: what counts as evidence, where uncertainty remains, and which paths deserve another reading.",
      "This distinction matters. A collection gathers objects; a knowledge graph gathers relations that can be inspected, challenged, and revised.",
    ],
  },
  {
    kicker: "II · Evidence and interpretation",
    title: "The ledger and the constellation.",
    paragraphs: [
      "Two views govern the research corpus. The ledger gives each item a stable place: author, date, provenance, status, and review history. The constellation reveals affinities that no single catalogue entry can hold.",
      "Neither view is sufficient by itself. Structure without interpretation becomes clerical; interpretation without structure becomes impossible to audit. Kepler keeps both within reach, allowing a reader to move from a broad pattern back to the sentence that produced it.",
      "The aim is not to remove ambiguity. It is to make ambiguity legible, so that another researcher can understand where confidence ends and conjecture begins.",
    ],
  },
  {
    kicker: "III · A durable scholarly record",
    title: "Revision is part of the evidence.",
    paragraphs: [
      "Research changes through correction. Names are reconciled, dates are narrowed, and an apparently decisive citation acquires a more careful translation. A durable system records these turns rather than hiding them.",
      "Annotations should remain attached to their object and to their moment. Comments invite exchange; highlights preserve attention; revisions make the history of interpretation visible.",
      "The resulting graph is not final. It is dependable precisely because its edges can be questioned and its claims can be traced.",
    ],
  },
];

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 72;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

/** Greedy word wrap using the embedded font's own metrics. */
function wrapText(text, font, size, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Adds a flat, one-level outline pointing each item at its page. */
function addOutline(document, titles) {
  const { context, catalog } = document;
  const pages = document.getPages();
  const rootRef = context.nextRef();
  const itemRefs = titles.map(() => context.nextRef());

  const root = context.obj({ Type: PDFName.of("Outlines"), Count: titles.length });

  titles.forEach((title, index) => {
    const item = PDFDict.withContext(context);
    item.set(PDFName.of("Title"), PDFHexString.fromText(title));
    item.set(PDFName.of("Parent"), rootRef);
    const destination = PDFArray.withContext(context);
    destination.push(pages[index].ref, PDFName.of("XYZ"), PDFNull, PDFNull, PDFNull);
    item.set(PDFName.of("Dest"), destination);
    if (index > 0) item.set(PDFName.of("Prev"), itemRefs[index - 1]);
    if (index < titles.length - 1) item.set(PDFName.of("Next"), itemRefs[index + 1]);
    context.assign(itemRefs[index], item);
  });

  root.set(PDFName.of("First"), itemRefs[0]);
  root.set(PDFName.of("Last"), itemRefs[itemRefs.length - 1]);
  context.assign(rootRef, root);
  catalog.set(PDFName.of("Outlines"), rootRef);
  catalog.set(PDFName.of("PageMode"), PDFName.of("UseOutlines"));
}

async function buildBasicPdf() {
  const document = await PDFDocument.create();
  const bodyFont = await document.embedFont(StandardFonts.Helvetica);
  const boldFont = await document.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await document.embedFont(StandardFonts.HelveticaOblique);
  const ink = rgb(0.11, 0.1, 0.09);
  const muted = rgb(0.42, 0.39, 0.35);

  for (const source of PAGES) {
    const page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let cursor = PAGE_HEIGHT - MARGIN;

    page.drawText(source.kicker, {
      x: MARGIN,
      y: cursor,
      size: 9,
      font: italicFont,
      color: muted,
    });
    cursor -= 28;

    for (const line of wrapText(source.title, boldFont, 22, CONTENT_WIDTH)) {
      page.drawText(line, { x: MARGIN, y: cursor, size: 22, font: boldFont, color: ink });
      cursor -= 28;
    }
    cursor -= 12;

    for (const paragraph of source.paragraphs) {
      for (const line of wrapText(paragraph, bodyFont, 11, CONTENT_WIDTH)) {
        page.drawText(line, { x: MARGIN, y: cursor, size: 11, font: bodyFont, color: ink });
        cursor -= 16;
      }
      cursor -= 12;
    }

    page.drawText(`Page ${document.getPageCount()}`, {
      x: MARGIN,
      y: MARGIN / 2,
      size: 8,
      font: bodyFont,
      color: muted,
    });
  }

  addOutline(
    document,
    PAGES.map((page) => page.title),
  );

  return document.save();
}

const here = path.dirname(fileURLToPath(import.meta.url));
const bytes = await buildBasicPdf();
const target = path.join(here, "basic.pdf");
writeFileSync(target, bytes);
console.log(`wrote ${path.relative(process.cwd(), target)} (${bytes.length} bytes)`);
