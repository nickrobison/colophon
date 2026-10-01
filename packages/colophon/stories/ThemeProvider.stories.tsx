import type { Meta, StoryObj } from "@storybook/react";
import { CphProvider, useCphTheme, useCphDensity } from "../src/theme/CphProvider";
import { CphBadge } from "../src/components/Badge/Badge";
function Controls() {
  const { theme, setTheme } = useCphTheme();
  const { density, setDensity } = useCphDensity();
  return (<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
    <CphBadge>{theme}</CphBadge><CphBadge>{density}</CphBadge>
    <button type="button" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>Toggle theme</button>
    <button type="button" onClick={() => setDensity(density === "comfortable" ? "dense" : "comfortable")}>Toggle density</button>
  </div>);
}
const meta: Meta<typeof CphProvider> = { title: "Colophon/ThemeProvider", component: CphProvider, decorators: [(Story) => <CphProvider><Story /></CphProvider>] };
export default meta;
type S = StoryObj<typeof CphProvider>;
export const Default: S = { render: () => <Controls /> };
export const Dark: S = { args: { defaultTheme: "dark" } };
export const Dense: S = { args: { defaultDensity: "dense" } };
