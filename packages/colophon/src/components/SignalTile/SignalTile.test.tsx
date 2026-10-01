import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CphSignalTile } from "./SignalTile";
describe("CphSignalTile", () => {
  it("renders numeral, value and delta chip", () => {
    render(<CphSignalTile label="Sources indexed" value="12,483" delta="+8.4%" mark="Ⅰ" />);
    expect(screen.getByText("12,483")).toBeVisible();
    expect(screen.getByText("+8.4%")).toBeVisible();
  });
  it("uses orange tone when urgent", () => {
    render(<CphSignalTile label="Open inquiries" value="17" delta="3 urgent" mark="Ⅳ" urgent />);
    expect(screen.getByText("3 urgent")).toHaveClass("cph-badge--orange");
  });
});
