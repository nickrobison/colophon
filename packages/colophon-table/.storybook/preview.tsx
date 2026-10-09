import { CphProvider } from "@nickrobison/colophon";
import type { Preview } from "@storybook/react";

import "@nickrobison/colophon/foundation.css";
import "@nickrobison/colophon/components.css";
import "../src/table-tokens.css";
import "../src/components.css";

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
