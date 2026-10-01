import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CphIcon } from "./CphIcon";
describe("CphIcon", () => {
  it("renders svg with aria-hidden by default", () => {
    const { container } = render(<CphIcon name="search" />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
  it("exposes accessible label when provided", () => {
    const { container } = render(<CphIcon name="moon" aria-label="Dark mode" />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-label", "Dark mode");
  });
});
