import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CphFieldRow } from "./CphFieldRow";

describe("CphFieldRow", () => {
  it("renders children inside .cph-form__row", () => {
    render(
      <CphFieldRow>
        <span>City</span>
      </CphFieldRow>,
    );
    const row = screen.getByText("City").closest(".cph-form__row");
    expect(row).toBeInTheDocument();
  });

  it("renders multiple children (city + state case)", () => {
    render(
      <CphFieldRow>
        <span>City</span>
        <span>State</span>
      </CphFieldRow>,
    );
    expect(screen.getByText("City")).toBeInTheDocument();
    expect(screen.getByText("State")).toBeInTheDocument();
  });

  it("appends className to the wrapper", () => {
    render(
      <CphFieldRow className="cph-test-extra">
        <span>Child</span>
      </CphFieldRow>,
    );
    const row = screen.getByText("Child").closest(".cph-form__row");
    expect(row).toHaveClass("cph-test-extra");
  });

  it("wrapper carries the cph-form__row class", () => {
    render(
      <CphFieldRow>
        <span>Child</span>
      </CphFieldRow>,
    );
    const row = screen.getByText("Child").closest(".cph-form__row");
    expect(row).toHaveClass("cph-form__row");
  });
});
