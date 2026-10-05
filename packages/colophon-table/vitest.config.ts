import { configDefaults, defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: { provider: "v8", reporter: ["text", "lcov"] },
    // Deviates from the other workspace packages: this package ships no tests yet,
    // and vitest exits 1 on an empty suite, which would fail `pnpm -r test`.
    // Delete once tests land, so a wiped suite cannot pass silently.
    passWithNoTests: true,
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
});
