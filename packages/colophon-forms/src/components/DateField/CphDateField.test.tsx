import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CphDateField } from "./CphDateField";

describe("CphDateField", () => {
  it("renders label and accessible group (happy path)", () => {
    const { container } = render(<CphDateField label="Start date" />);
    expect(screen.getByText("Start date")).toBeVisible();
    expect(screen.getAllByRole("group", { name: "Start date" })).toHaveLength(2);
    expect(
      container.querySelectorAll('[data-type="month"], [data-type="day"], [data-type="year"]'),
    ).toHaveLength(3);
  });

  it("renders help text when provided; omits when not", () => {
    const { rerender } = render(<CphDateField label="Start date" help="Pick a future date." />);
    expect(screen.getByText("Pick a future date.")).toBeVisible();

    rerender(<CphDateField label="Start date" />);
    expect(screen.queryByText("Pick a future date.")).not.toBeInTheDocument();
  });

  it("forwards id to the date input group", () => {
    const { container } = render(<CphDateField label="Start date" id="start-field" />);

    expect(container.querySelector(".cph-field__date-input")).toHaveAttribute("id", "start-field");
  });

  it("fires onBlur when focus leaves the field, not between segments", async () => {
    const user = userEvent.setup();
    const onBlur = vi.fn();
    render(
      <>
        <CphDateField label="Start date" onBlur={onBlur} />
        <button>Next field</button>
      </>,
    );

    await user.tab();
    expect(screen.getByRole("spinbutton", { name: /month/i })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("spinbutton", { name: /day/i })).toHaveFocus();
    expect(onBlur).not.toHaveBeenCalled();
    await user.tab();
    expect(screen.getByRole("spinbutton", { name: /year/i })).toHaveFocus();
    expect(onBlur).not.toHaveBeenCalled();
    await user.tab();

    expect(screen.getByRole("button", { name: "Next field" })).toHaveFocus();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("renders Required marker when marker='required'", () => {
    render(<CphDateField label="Start date" marker="required" />);
    expect(screen.getByText("Required")).toBeVisible();
  });

  it("renders Optional marker when marker='optional'", () => {
    render(<CphDateField label="Start date" marker="optional" />);
    expect(screen.getByText("Optional")).toBeVisible();
  });

  it("fires onChange with parsed date after keyboard entry and blur", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(<CphDateField label="Start date" onChange={onChange} />);

    const month = container.querySelector('[data-type="month"]');
    expect(month).not.toBeNull();
    (month as HTMLElement).focus();
    await user.keyboard("06122025");
    await user.tab();

    expect(onChange).toHaveBeenCalled();
    const value = onChange.mock.calls[onChange.mock.calls.length - 1]![0];
    expect(value).not.toBeNull();
    expect(value.year).toBe(2025);
    expect(value.month).toBe(6);
    expect(value.day).toBe(12);
  });

  it("navigates to day segment with ArrowRight from month", async () => {
    const user = userEvent.setup();
    const { container } = render(<CphDateField label="Start date" />);

    const month = container.querySelector('[data-type="month"]');
    expect(month).not.toBeNull();
    (month as HTMLElement).focus();
    await user.keyboard("{ArrowRight}");

    expect(container.querySelector('[data-type="day"]')).toHaveFocus();
  });

  it("shows validation error and data-invalid on invalid value", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <CphDateField
        label="Start date"
        validate={(v) => {
          const d = v as { year?: number } | null;
          return d && d.year === 2025 ? "Pick a later year." : true;
        }}
      />,
    );

    const month = container.querySelector('[data-type="month"]');
    expect(month).not.toBeNull();
    (month as HTMLElement).focus();
    await user.keyboard("06122025");
    await user.tab();

    expect(screen.getByRole("alert")).toHaveTextContent("Pick a later year.");
    expect(container.querySelector(".cph-field__date-group")).toHaveAccessibleDescription(
      "Selected Date: June 12, 2025 Pick a later year.",
    );
    expect(container.querySelector(".cph-field")).toHaveAttribute("data-invalid", "true");
  });

  it("shows and associates a fallback message when explicitly invalid", () => {
    const { container } = render(<CphDateField label="Start date" isInvalid />);

    expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid date.");
    expect(container.querySelector(".cph-field__date-group")).toHaveAccessibleDescription(
      "Enter a valid date.",
    );
  });

  it("does not fire onChange when disabled", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <CphDateField label="Start date" isDisabled onChange={onChange} />,
    );

    const month = container.querySelector('[data-type="month"]');
    expect(month).not.toBeNull();
    (month as HTMLElement).focus();
    await user.keyboard("06122025");

    expect(onChange).not.toHaveBeenCalled();
  });
});
