import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CphNavSection } from "./NavSection";
describe("CphNavSection", () => {
  it("exposes a collapsible button with aria-expanded", async () => {
    const user = userEvent.setup();
    render(
      <CphNavSection title="Workspace">
        <span>content</span>
      </CphNavSection>,
    );
    const trigger = screen.getByRole("button", { name: /Workspace/ });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
