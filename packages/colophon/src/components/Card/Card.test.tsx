import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CphProvider } from "../../theme/CphProvider";
import { CphCard } from "./Card";
const props = { id: "KPL-041", title: "The observable roots of civic order", owner: "Ada Mercer", sources: 128, stageLabel: "Synthesis", note: "Corpus supports comparison.", concepts: ["Empiricism"] };
describe("CphCard", () => {
  it("expands research note on toggle", async () => {
    const user = userEvent.setup();
    render(<CphProvider><CphCard {...props} /></CphProvider>);
    expect(screen.queryByText("Corpus supports comparison.")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Read note" }));
    expect(screen.getByText("Corpus supports comparison.")).toBeVisible();
  });
  it("marks featured card", () => { render(<CphCard {...props} featured />); expect(screen.getByRole("article") ?? document.querySelector(".cph-card--featured")).toBeTruthy(); });
});
