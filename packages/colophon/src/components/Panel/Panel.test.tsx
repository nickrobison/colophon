import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CphPanel } from "./Panel";
describe("CphPanel", () => {
  it("renders heading, body and footer", () => {
    render(
      <CphPanel heading={<h2>Inquiry register</h2>} footer={<span>4 of 17</span>}>
        <p>Rows</p>
      </CphPanel>,
    );
    expect(screen.getByRole("heading", { name: "Inquiry register" })).toBeVisible();
    expect(screen.getByText("Rows")).toBeVisible();
    expect(screen.getByText("4 of 17")).toBeVisible();
  });
});
