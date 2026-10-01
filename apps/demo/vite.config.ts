import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import path from "node:path";
const pkg = path.resolve(__dirname, "../../packages/colophon");
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: "@nickrobison/colophon/foundation.css", replacement: path.join(pkg, "src/foundation/tokens.css") },
      { find: "@nickrobison/colophon/components.css", replacement: path.join(pkg, "src/components.css") },
      { find: "@nickrobison/colophon-forms", replacement: path.resolve(__dirname, "../../packages/colophon-forms/src/index.ts") },
      { find: "@nickrobison/colophon", replacement: path.join(pkg, "src/index.ts") },
    ],
  },
  server: { port: 5173 },
});
