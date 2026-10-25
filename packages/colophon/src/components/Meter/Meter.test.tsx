import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CphMeter } from "./Meter";

describe("CphMeter", () => {
  it("renders a positive signed value and tone", () => {
    render(<CphMeter value={2.3} suffix="pts" />);

    expect(screen.getByText("+2.3 pts")).toBeInTheDocument();
    expect(screen.getByRole("meter")).toHaveClass("cph-meter--positive");
  });

  it("renders a negative signed value and tone", () => {
    render(<CphMeter value={-1.2} suffix="pts" />);

    expect(screen.getByText("-1.2 pts")).toBeInTheDocument();
    expect(screen.getByRole("meter")).toHaveClass("cph-meter--negative");
  });

  it("renders the neutral tone for zero", () => {
    render(<CphMeter value={0} />);

    expect(screen.getByRole("meter")).toHaveClass("cph-meter--neutral");
  });

  it("uses the default max value when calculating fill width", () => {
    const { container } = render(<CphMeter value={10} />);

    expect(container.querySelector(".cph-meter__fill")).toHaveStyle({ width: "50%" });
  });

  it("caps fill width at 100 percent when value exceeds max", () => {
    const { container } = render(<CphMeter value={25} max={20} />);

    expect(container.querySelector(".cph-meter__fill")).toHaveStyle({ width: "100%" });
  });

  it("exposes absolute value and configured range through ARIA attributes", () => {
    render(<CphMeter value={-1.2} max={10} suffix="pts" />);
    const meter = screen.getByRole("meter");

    expect(meter).toHaveAttribute("aria-valuenow", "1.2");
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "10");
  });

  it("uses ariaLabel as the accessible name when provided", () => {
    render(<CphMeter value={2.3} suffix="pts" ariaLabel="Custom name" />);

    expect(screen.getByRole("meter", { name: "Custom name" })).toBeInTheDocument();
  });

  it("uses the signed value text as the accessible name without a label", () => {
    render(<CphMeter value={2.3} suffix="pts" />);

    expect(screen.getByRole("meter", { name: "+2.3 pts" })).toBeInTheDocument();
  });

  it("uses a string label as the accessible name when ariaLabel is absent", () => {
    render(<CphMeter value={2.3} label="Coding Index" />);

    expect(screen.getByRole("meter", { name: "Coding Index" })).toBeInTheDocument();
  });

  it("adds the compact class when compact is enabled", () => {
    render(<CphMeter value={2.3} compact />);

    expect(screen.getByRole("meter")).toHaveClass("cph-meter--compact");
  });

  it("merges a custom className onto the root", () => {
    render(<CphMeter value={2.3} className="cph-meter--neutral" />);

    expect(screen.getByRole("meter")).toHaveClass(
      "cph-meter",
      "cph-meter--positive",
      "cph-meter--neutral",
    );
  });
});
