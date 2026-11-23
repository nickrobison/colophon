import { readFileSync } from "node:fs";
import path from "node:path";

import { createLocalEngine } from "@embedpdf/engine";
import { describe, expect, it } from "vitest";

const fixtureBytes = readFileSync(path.join(import.meta.dirname, "../../fixtures/basic.pdf"));

describe("EmbedPDF engine (real PDFium)", () => {
  it("opens the committed fixture, reports three pages, and extracts page-one text", async () => {
    const engine = createLocalEngine({ runtime: { prefer: "wasm" } });
    try {
      const document = await engine.open({ kind: "bytes", bytes: fixtureBytes });

      const pages = await document.pages.list();
      expect(pages.pageCount).toBe(3);

      const firstPage = pages.pages[0];
      if (!firstPage) {
        throw new Error("fixture has no pages");
      }
      const text = await document.page(firstPage.ref).text.get();
      expect(text.text).toContain("Knowledge does not arrive alone.");
    } finally {
      await engine.destroy();
    }
  }, 30_000);
});
