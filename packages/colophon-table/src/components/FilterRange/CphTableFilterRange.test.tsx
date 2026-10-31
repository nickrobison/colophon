import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { CphTableFilterRange, type CphTableFilterRangeValue } from "./CphTableFilterRange";

function ControlledRange({
  initial,
  onValueChange,
  label,
  min,
  max,
  step,
  placeholder,
  ariaLabel,
}: {
  initial?: CphTableFilterRangeValue;
  onValueChange?: (value: CphTableFilterRangeValue) => void;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: { min?: string; max?: string };
  ariaLabel?: string;
}) {
  const [value, setValue] = useState<CphTableFilterRangeValue>(initial ?? {});
  return (
    <CphTableFilterRange
      value={value}
      onValueChange={(next) => {
        setValue(next);
        onValueChange?.(next);
      }}
      {...(label === undefined ? {} : { label })}
      {...(min === undefined ? {} : { min })}
      {...(max === undefined ? {} : { max })}
      {...(step === undefined ? {} : { step })}
      {...(placeholder === undefined ? {} : { placeholder })}
      {...(ariaLabel === undefined ? {} : { "aria-label": ariaLabel })}
    />
  );
}

describe("CphTableFilterRange", () => {
  it("renders two spinbutton inputs inside a labelled group", () => {
    render(<ControlledRange label="Value" />);
    expect(screen.getByRole("group", { name: "Value" })).toHaveClass("cph-table__filter-range");
    expect(screen.getByRole("spinbutton", { name: "Value min" })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "Value max" })).toBeInTheDocument();
  });

  it("falls back to a default accessible name without label or aria-label", () => {
    render(<CphTableFilterRange />);
    expect(screen.getByRole("group", { name: "Filter by range" })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "Filter by range min" })).toBeInTheDocument();
  });

  it("prefers aria-label over label for the group name", () => {
    render(<CphTableFilterRange label="Value" aria-label="Score bounds" />);
    expect(screen.getByRole("group", { name: "Score bounds" })).toBeInTheDocument();
  });

  it("emits a partial value when only min is typed", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ControlledRange onValueChange={onValueChange} />);
    await user.type(screen.getByRole("spinbutton", { name: "Filter by range min" }), "10");
    expect(onValueChange).toHaveBeenLastCalledWith({ min: 10 });
  });

  it("emits a partial value when only max is typed", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ControlledRange onValueChange={onValueChange} />);
    await user.type(screen.getByRole("spinbutton", { name: "Filter by range max" }), "100");
    expect(onValueChange).toHaveBeenLastCalledWith({ max: 100 });
  });

  it("keeps the other bound when one side changes", async () => {
    const user = userEvent.setup();
    render(<ControlledRange initial={{ min: 5, max: 50 }} />);
    const minInput = screen.getByRole("spinbutton", { name: "Filter by range min" });
    expect(minInput).toHaveValue(5);
    await user.clear(minInput);
    await user.type(minInput, "7");
    expect(minInput).toHaveValue(7);
    expect(screen.getByRole("spinbutton", { name: "Filter by range max" })).toHaveValue(50);
  });

  it("omits the bound key when the input is cleared", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ControlledRange initial={{ min: 5, max: 50 }} onValueChange={onValueChange} />);
    await user.clear(screen.getByRole("spinbutton", { name: "Filter by range min" }));
    expect(onValueChange).toHaveBeenLastCalledWith({ max: 50 });
  });

  it("applies min/max/step attributes to both inputs", () => {
    render(<ControlledRange min={0} max={100} step={5} />);
    for (const name of ["Filter by range min", "Filter by range max"]) {
      const input = screen.getByRole("spinbutton", { name });
      expect(input).toHaveAttribute("min", "0");
      expect(input).toHaveAttribute("max", "100");
      expect(input).toHaveAttribute("step", "5");
    }
  });

  it("defaults step to 1", () => {
    render(<ControlledRange />);
    expect(screen.getByRole("spinbutton", { name: "Filter by range min" })).toHaveAttribute(
      "step",
      "1",
    );
  });

  it("renders per-side placeholders", () => {
    render(<ControlledRange placeholder={{ min: "from", max: "to" }} />);
    expect(screen.getByPlaceholderText("from")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("to")).toBeInTheDocument();
  });

  it("renders the visible label element when provided", () => {
    render(<ControlledRange label="Value" />);
    expect(screen.getByText("Value")).toBeInTheDocument();
  });

  it("merges className onto the root", () => {
    render(<CphTableFilterRange className="mt-4" />);
    expect(screen.getByTestId("filter-range")).toHaveClass("cph-table__filter-range", "mt-4");
  });

  it("emits combined bounds when both sides are typed", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ControlledRange onValueChange={onValueChange} />);
    await user.type(screen.getByRole("spinbutton", { name: "Filter by range min" }), "10");
    await user.type(screen.getByRole("spinbutton", { name: "Filter by range max" }), "90");
    expect(onValueChange).toHaveBeenLastCalledWith({ min: 10, max: 90 });
  });

  it("renames the group and inputs when aria-label is provided", () => {
    render(<CphTableFilterRange aria-label="Score bounds" />);
    expect(screen.getByRole("group", { name: "Score bounds" })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "Score bounds min" })).toBeInTheDocument();
    expect(screen.getByRole("spinbutton", { name: "Score bounds max" })).toBeInTheDocument();
  });

  it("renders with no value prop at all", () => {
    render(<CphTableFilterRange label="Value" />);
    expect(screen.getByRole("spinbutton", { name: "Value min" })).toHaveValue(null);
    expect(screen.getByRole("spinbutton", { name: "Value max" })).toHaveValue(null);
  });
});
