import { defineConfig, devices, type PlaywrightTestConfig } from "playwright/test";

export function createStorybookE2EConfig(options: {
  port: number;
  projects: PlaywrightTestConfig["projects"];
}) {
  return defineConfig({
    testDir: "./e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: "list",
    use: {
      baseURL: `http://127.0.0.1:${options.port}`,
      trace: "retain-on-failure",
    },
    projects: options.projects,
    webServer: {
      command: `pnpm build-storybook && npx http-server storybook-static --port ${options.port} --silent`,
      url: `http://127.0.0.1:${options.port}`,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  });
}

export { devices };
