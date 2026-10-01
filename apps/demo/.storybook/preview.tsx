import type { Preview } from "@storybook/react";
import "@nickrobison/colophon/foundation.css";
import "@nickrobison/colophon/components.css";
import "../src/demo.css";
import { CphProvider } from "@nickrobison/colophon";
const preview: Preview = {
  decorators: [(Story) => (<CphProvider><Story /></CphProvider>)],
  parameters: { layout: "fullscreen", controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } } },
};
export default preview;
