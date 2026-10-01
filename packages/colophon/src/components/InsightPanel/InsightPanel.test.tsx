import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CphInsightPanel } from "./InsightPanel";
describe("CphInsightPanel", () => {
  it("reveals evidence brief on action", async () => {
    const user = userEvent.setup();
    render(
      <CphInsightPanel title="An emerging connection" brief="16 citations share vocabulary.">
        <p>Body</p>
      </CphInsightPanel>,
    );
    expect(screen.queryByText("16 citations share vocabulary.")).toBeNull();
    await user.click(screen.getByRole("button", { name: /Examine/ }));
    expect(screen.getByText("16 citations share vocabulary.")).toBeVisible();
  });
});
