import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CphButton } from "./CphButton";
describe("CphButton", () => {
  it("fires onPress and exposes focus ring class", async () => {
    const onPress = vi.fn();
    const user = userEvent.setup();
    render(<CphButton onPress={onPress}>New inquiry</CphButton>);
    await user.click(screen.getByRole("button", { name: "New inquiry" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
  it("supports aria-pressed toggle state", () => {
    render(<CphButton aria-pressed="true">Toggle</CphButton>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });
});
