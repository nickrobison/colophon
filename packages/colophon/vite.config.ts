import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import path from "node:path";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { lib: { entry: path.resolve(__dirname, "src/index.ts"), formats: ["es"], fileName: () => "index.js" }, rollupOptions: { external: ["react", "react-dom", "react-aria-components"] } }
});
