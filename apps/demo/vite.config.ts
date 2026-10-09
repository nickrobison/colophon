import path from "node:path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
const pkg = path.resolve(__dirname, "../../packages/colophon");
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: "@nickrobison/colophon/foundation.css",
        replacement: path.join(pkg, "src/foundation/tokens.css"),
      },
      {
        find: "@nickrobison/colophon/components.css",
        replacement: path.join(pkg, "src/components.css"),
      },
      {
        find: "@nickrobison/colophon-forms",
        replacement: path.resolve(__dirname, "../../packages/colophon-forms/src/index.ts"),
      },
      {
        find: "@nickrobison/colophon-table/components.css",
        replacement: path.resolve(__dirname, "../../packages/colophon-table/src/components.css"),
      },
      {
        find: "@nickrobison/colophon-table/table-tokens.css",
        replacement: path.resolve(__dirname, "../../packages/colophon-table/src/table-tokens.css"),
      },
      {
        find: "@nickrobison/colophon-table",
        replacement: path.resolve(__dirname, "../../packages/colophon-table/src/index.ts"),
      },
      { find: "@nickrobison/colophon", replacement: path.join(pkg, "src/index.ts") },
    ],
  },
  server: { port: 5173 },
});
