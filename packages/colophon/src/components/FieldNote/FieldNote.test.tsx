import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CphFieldNote } from "./FieldNote";
describe("CphFieldNote", () => {
  it("renders quote and caption", () => {
    render(<CphFieldNote quote="Knowledge is a network." caption="Research principle" />);
    expect(screen.getByText("Knowledge is a network.")).toBeVisible();
    expect(screen.getByText("Research principle")).toBeVisible();
  });
});
