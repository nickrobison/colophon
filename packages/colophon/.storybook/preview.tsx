import type { Preview } from "@storybook/react";

import "../src/foundation/tokens.css";
import "../src/components.css";
import { CphProvider } from "../src/theme/CphProvider";
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
