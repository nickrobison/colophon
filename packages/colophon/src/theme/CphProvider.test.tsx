import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CphProvider, useCphTheme } from "./CphProvider";
function Probe() { const { theme, setTheme } = useCphTheme(); return <button onClick={() => setTheme("dark")}>theme:{theme}</button>; }
describe("CphProvider", () => {
  it("applies data-theme dark", async () => {
    const user = userEvent.setup();
    render(<CphProvider><Probe /></CphProvider>);
    await user.click(screen.getByRole("button"));
    expect(document.querySelector(".cph-root")).toHaveAttribute("data-theme", "dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
  it("applies dense density", () => { render(<CphProvider defaultDensity="dense"><span>hi</span></CphProvider>); expect(document.querySelector(".cph-root")).toHaveAttribute("data-density", "dense"); });
});
