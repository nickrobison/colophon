import { configDefaults, defineConfig } from "vitest/config";

export function createVitestConfig(options?: { excludeE2E?: boolean }) {
  return defineConfig({
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./vitest.setup.ts"],
      coverage: { provider: "v8", reporter: ["text", "lcov"] },
      ...(options?.excludeE2E ? { exclude: [...configDefaults.exclude, "e2e/**"] } : {}),
    },
  });
}
