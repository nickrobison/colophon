import { configDefaults, defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: { provider: "v8", reporter: ["text", "lcov"] },
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
