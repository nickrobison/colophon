import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CphField } from "./CphField";
describe("CphField", () => {
  it("renders label and input", () => {
    render(<CphField label="Inquiry title" />);
    expect(screen.getByText("Inquiry title")).toBeVisible();
    expect(screen.getByRole("textbox")).toBeVisible();
  });
});
