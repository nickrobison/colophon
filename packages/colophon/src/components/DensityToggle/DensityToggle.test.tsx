import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CphProvider } from "../../theme/CphProvider";
import { CphDensityToggle, CphThemeToggle } from "./DensityToggle";
describe("CphDensityToggle", () => {
  it("switches density via radiogroup", async () => {
    const user = userEvent.setup();
    render(<CphProvider><CphDensityToggle /></CphProvider>);
    await user.click(screen.getByRole("radio", { name: "Dense density" }));
    expect(document.querySelector(".cph-root")).toHaveAttribute("data-density", "dense");
  });
});
describe("CphThemeToggle", () => {
  it("toggles to dark mode", async () => {
    const user = userEvent.setup();
    render(<CphProvider><CphThemeToggle /></CphProvider>);
    await user.click(screen.getByRole("button", { name: "Switch to dark mode" }));
    expect(document.querySelector(".cph-root")).toHaveAttribute("data-theme", "dark");
  });
});
