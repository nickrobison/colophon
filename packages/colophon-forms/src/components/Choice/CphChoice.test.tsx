import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CphCheckbox } from "./CphCheckbox";
import { CphRadio } from "./CphRadio";

describe("CphCheckbox", () => {
  it("renders label and checkbox (happy path)", () => {
    render(<CphCheckbox label="Accept terms" name="terms" />);
    const checkbox = screen.getByRole("checkbox", { name: "Accept terms" });
    expect(checkbox).toBeVisible();
    expect(checkbox).not.toBeChecked();
  });

  it("renders help text when provided; omits when not", () => {
    const { rerender } = render(
      <CphCheckbox label="Newsletter" help="We'll never spam you." name="newsletter" />,
    );
    expect(screen.getByText("We'll never spam you.")).toBeVisible();

    rerender(<CphCheckbox label="Newsletter" name="newsletter" />);
    expect(screen.queryByText("We'll never spam you.")).not.toBeInTheDocument();
  });

  it("toggles selection on click", async () => {
    const user = userEvent.setup();
    render(<CphCheckbox label="Subscribe" name="subscribe" />);

    const checkbox = screen.getByRole("checkbox", { name: "Subscribe" });
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it("renders error message with icon when provided", () => {
    render(
      <CphCheckbox label="Required" name="required" errorMessage="You must agree." />,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("You must agree.");
    expect(alert).toContainHTML("svg");
  });

  it("disabled checkbox is not interactive", () => {
    render(<CphCheckbox label="Locked" name="locked" isDisabled />);
    const checkbox = screen.getByRole("checkbox", { name: "Locked" });
    expect(checkbox).toBeDisabled();
    expect(checkbox).not.toBeEnabled();
  });
});

describe("CphRadio", () => {
  const options = [
    { value: "basic", label: "Basic" },
    { value: "pro", label: "Pro" },
    { value: "enterprise", label: "Enterprise" },
  ];

  it("renders legend and all radio options", () => {
    render(<CphRadio legend="Choose a plan" name="plan" options={options} />);

    expect(screen.getByRole("radiogroup", { name: "Choose a plan" })).toBeVisible();
    expect(screen.getByRole("radio", { name: "Basic" })).toBeVisible();
    expect(screen.getByRole("radio", { name: "Pro" })).toBeVisible();
    expect(screen.getByRole("radio", { name: "Enterprise" })).toBeVisible();
  });

  it("renders help text when provided; omits when not", () => {
    const { rerender } = render(
      <CphRadio legend="Plan" name="plan" options={options} help="Cancel anytime." />,
    );
    expect(screen.getByText("Cancel anytime.")).toBeVisible();

    rerender(<CphRadio legend="Plan" name="plan" options={options} />);
    expect(screen.queryByText("Cancel anytime.")).not.toBeInTheDocument();
  });

  it("selects a radio option on click", async () => {
    const user = userEvent.setup();
    render(<CphRadio legend="Choose a plan" name="plan" options={options} />);

    const proRadio = screen.getByRole("radio", { name: "Pro" });
    expect(proRadio).not.toBeChecked();

    await user.click(proRadio);
    expect(proRadio).toBeChecked();
  });

  it("renders error message when provided", () => {
    render(
      <CphRadio
        legend="Choose a plan"
        name="plan"
        options={options}
        errorMessage="Please select a plan."
      />,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Please select a plan.");
    expect(alert).toContainHTML("svg");
  });

  it("disabled radio group prevents selection", () => {
    render(<CphRadio legend="Choose a plan" name="plan" options={options} isDisabled />);

    const basicRadio = screen.getByRole("radio", { name: "Basic" });
    expect(basicRadio).toBeDisabled();
    expect(basicRadio).not.toBeEnabled();
  });

  it("preselects the default value", () => {
    render(
      <CphRadio legend="Choose a plan" name="plan" options={options} defaultValue="pro" />,
    );

    const proRadio = screen.getByRole("radio", { name: "Pro" });
    expect(proRadio).toBeChecked();

    const basicRadio = screen.getByRole("radio", { name: "Basic" });
    expect(basicRadio).not.toBeChecked();
  });
});
