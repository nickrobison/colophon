import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CphTable } from "./CphTable";
const rows = [{ id: "KPL-041", inquiry: "Civic order", owner: "Ada Mercer", sources: 128, stageLabel: "Synthesis", updated: "12 min ago", note: "Comparison ready.", concepts: [] }];
describe("CphTable", () => {
  it("expands detail row on toggle", async () => {
    const user = userEvent.setup();
    render(<CphTable rows={rows} />);
    expect(screen.queryByText("Comparison ready.")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Expand Civic order" }));
    expect(screen.getByText("Comparison ready.")).toBeVisible();
  });
});
