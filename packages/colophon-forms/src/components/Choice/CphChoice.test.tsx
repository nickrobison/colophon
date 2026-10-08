import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

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
    render(<CphCheckbox label="Required" name="required" errorMessage="You must agree." />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("You must agree.");
    expect(alert).toContainHTML("svg");
  });

  it("exposes checkbox help and error in the input's accessible description", () => {
    render(
      <CphCheckbox
        label="Required"
        name="required"
        help="Needed to publish."
        errorMessage="You must agree."
      />,
    );

    const checkbox = screen.getByRole("checkbox", { name: "Required" });
    expect(checkbox).toHaveAccessibleDescription("Needed to publish. You must agree.");
  });

  it("preserves a caller-supplied aria-describedby alongside the generated ids", () => {
    render(
      <CphCheckbox
        label="Required"
        name="required"
        help="Needed to publish."
        aria-describedby="external-help"
      />,
    );

    const describedBy = screen
      .getByRole("checkbox", { name: "Required" })
      .getAttribute("aria-describedby");

    expect(describedBy).toContain("external-help");
    // Two further ids: the generated help and error references.
    expect(describedBy?.split(" ")).toHaveLength(2);
  });

  it("disabled checkbox is not interactive", () => {
    render(<CphCheckbox label="Locked" name="locked" isDisabled />);
    const checkbox = screen.getByRole("checkbox", { name: "Locked" });
    expect(checkbox).toBeDisabled();
    expect(checkbox).not.toBeEnabled();
  });

  it("carries cph-choice classes and data-disabled on the same element when disabled", () => {
    const { container } = render(<CphCheckbox label="Locked" name="locked" isDisabled />);
    const choice = container.querySelector(".cph-choice");
    expect(choice).not.toBeNull();
    expect(choice).toHaveAttribute("data-disabled", "true");
  });

  it("invokes className callback with render props and applies the result", () => {
    const callback = vi.fn(({ isDisabled }) => (isDisabled ? "is-disabled" : "is-enabled"));
    const { container } = render(<CphCheckbox label="Test" name="test" className={callback} />);

    expect(callback).toHaveBeenCalled();
    expect(container.querySelector(".cph-choice")).toHaveClass("is-enabled");
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

  it("renders option description when provided", () => {
    const optionsWithDesc = [
      { value: "basic", label: "Basic", description: "Good for starters" },
      { value: "pro", label: "Pro" },
    ];
    render(<CphRadio legend="Choose a plan" name="plan" options={optionsWithDesc} />);

    expect(screen.getByText("Good for starters")).toBeVisible();
    expect(screen.queryByText("Good for starters")).toBeInTheDocument();
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

  it("exposes radio help and error in the group's accessible description", () => {
    render(
      <CphRadio
        legend="Choose a plan"
        name="plan"
        options={options}
        help="One per submission."
        errorMessage="Please select a plan."
      />,
    );

    const group = screen.getByRole("radiogroup", { name: "Choose a plan" });
    expect(group).toHaveAccessibleDescription("One per submission. Please select a plan.");
  });

  it("shows and associates the native required message after submission", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <CphRadio legend="Choose a plan" name="plan" options={options} isRequired />
        <button type="submit">Submit</button>
      </form>,
    );

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Submit" }));

    const group = screen.getByRole("radiogroup", { name: "Choose a plan" });
    const alert = screen.getByRole("alert");
    expect(alert).toBeVisible();
    expect(alert).toHaveTextContent("Constraints not satisfied");
    expect(alert).toContainHTML("svg");
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAccessibleDescription("Constraints not satisfied");
    expect(onSubmit).not.toHaveBeenCalled();

    await user.click(screen.getByRole("radio", { name: "Pro" }));
    await user.click(screen.getByRole("button", { name: "Submit" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(group).not.toHaveAttribute("aria-invalid");
    expect(group).not.toHaveAccessibleDescription();
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it.each(["native", "aria"] as const)(
    "shows and associates a validate message with %s validation",
    async (validationBehavior) => {
      const user = userEvent.setup();
      render(
        <form onSubmit={(event) => event.preventDefault()}>
          <CphRadio
            legend="Choose a plan"
            name="plan"
            options={options}
            help="One per submission."
            validationBehavior={validationBehavior}
            validate={(value) => (value === "pro" ? true : "Please choose Pro.")}
          />
          <button type="submit">Submit</button>
        </form>,
      );

      await user.click(screen.getByRole("radio", { name: "Basic" }));
      await user.click(screen.getByRole("button", { name: "Submit" }));

      const group = screen.getByRole("radiogroup", { name: "Choose a plan" });
      expect(screen.getByRole("alert")).toHaveTextContent("Please choose Pro.");
      expect(group).toHaveAttribute("aria-invalid", "true");
      expect(group).toHaveAccessibleDescription("One per submission. Please choose Pro.");

      await user.click(screen.getByRole("radio", { name: "Pro" }));
      await user.click(screen.getByRole("button", { name: "Submit" }));
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(group).not.toHaveAttribute("aria-invalid");
      expect(group).toHaveAccessibleDescription("One per submission.");
    },
  );

  it("shows and associates a fallback when explicitly invalid without a message", () => {
    render(<CphRadio legend="Choose a plan" name="plan" options={options} isInvalid />);

    expect(screen.getByRole("alert")).toHaveTextContent("Choose an option.");
    expect(screen.getByRole("radiogroup", { name: "Choose a plan" })).toHaveAccessibleDescription(
      "Choose an option.",
    );
  });

  it("prefers a custom message over the validation message", () => {
    render(
      <CphRadio
        legend="Choose a plan"
        name="plan"
        options={options}
        validationBehavior="aria"
        validate={() => "Validation message."}
        errorMessage="Custom message."
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Custom message.");
    expect(screen.queryByText("Validation message.")).not.toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "Choose a plan" })).toHaveAccessibleDescription(
      "Custom message.",
    );
  });

  it("disabled radio group prevents selection", () => {
    render(<CphRadio legend="Choose a plan" name="plan" options={options} isDisabled />);

    const basicRadio = screen.getByRole("radio", { name: "Basic" });
    expect(basicRadio).toBeDisabled();
    expect(basicRadio).not.toBeEnabled();
  });

  it("preselects the default value", () => {
    render(<CphRadio legend="Choose a plan" name="plan" options={options} defaultValue="pro" />);

    const proRadio = screen.getByRole("radio", { name: "Pro" });
    expect(proRadio).toBeChecked();

    const basicRadio = screen.getByRole("radio", { name: "Basic" });
    expect(basicRadio).not.toBeChecked();
  });

  it("invokes className callback with render props and applies the result to RadioGroup", () => {
    const callback = vi.fn(({ isDisabled }) => (isDisabled ? "is-disabled" : "is-enabled"));
    const { container } = render(
      <CphRadio legend="Choose a plan" name="plan" options={options} className={callback} />,
    );

    expect(callback).toHaveBeenCalled();
    expect(container.querySelector(".cph-choice-group")).toBeInTheDocument();
    const radioGroup = screen.getByRole("radiogroup");
    expect(radioGroup).toHaveClass("is-enabled");
  });
});
