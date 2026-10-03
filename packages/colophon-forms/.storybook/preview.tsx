import { CphProvider } from "@nickrobison/colophon";

import "@nickrobison/colophon/foundation.css";
import "@nickrobison/colophon/components.css";
import "../src/components.css";
import type { Preview } from "@storybook/react";
const preview: Preview = {
  decorators: [
    (Story) => (
      <CphProvider>
        <Story />
      </CphProvider>
    ),
  ],
  parameters: { a11y: { test: "todo" } },
};
export default preview;
