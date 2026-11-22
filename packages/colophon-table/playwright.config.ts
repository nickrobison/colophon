import { createStorybookE2EConfig, devices } from "../../tools/config/playwright.base";

export default createStorybookE2EConfig({
  port: 6408,
  projects: [
    {
      name: "chromium",
      use: { ...devices["chromium"] },
    },
  ],
});
