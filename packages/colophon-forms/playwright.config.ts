import { createStorybookE2EConfig, devices } from "../../tools/config/playwright.base";

export default createStorybookE2EConfig({
  port: 6407,
  projects: [
    {
      name: "firefox",
      // browserName is explicit: devices["firefox"] is undefined (the registry only
      // has "Desktop Firefox"), so the spread yields {} and Playwright falls
      // back to chromium without complaining.
      use: { ...devices["Desktop Firefox"], browserName: "firefox" },
    },
  ],
});
