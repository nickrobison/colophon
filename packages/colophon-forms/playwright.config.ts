import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:6007",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["chromium"] },
    },
  ],
  webServer: {
    command: "pnpm build-storybook && npx http-server storybook-static --port 6007 --silent",
    url: "http://127.0.0.1:6007",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
