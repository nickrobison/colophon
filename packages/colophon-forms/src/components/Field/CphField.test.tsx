import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { CphField } from "./CphField";

describe("CphField", () => {
  it("renders label and accessible textbox (happy path)", () => {
    render(<CphField label="Inquiry title" />);
    expect(screen.getByLabelText("Inquiry title")).toBeVisible();
    expect(screen.getByRole("textbox")).toBeVisible();
  });

  it("renders help text when provided; omits when not", () => {
    const { rerender } = render(<CphField label="Email" help="We'll never share this." />);
    expect(screen.getByText("We'll never share this.")).toBeVisible();

    rerender(<CphField label="Email" />);
    expect(screen.queryByText("We'll never share this.")).not.toBeInTheDocument();
  });

  it("renders Required marker when marker='required'", () => {
    render(<CphField label="Name" marker="required" />);
    expect(screen.getByText("Required")).toBeVisible();
  });

  it("renders Optional marker when marker='optional'", () => {
    render(<CphField label="Nickname" marker="optional" />);
    expect(screen.getByText("Optional")).toBeVisible();
  });

  it("shows the validate message with icon and aria-invalid on an invalid value", async () => {
    const user = userEvent.setup();
    render(
      <CphField
        label="Email"
        type="email"
        validate={(value: string) =>
          value.includes("@") ? value.length < 3 ? "Too short." : true : "Enter a valid email address."
        }
      />,
    );

    const input = screen.getByLabelText("Email");
    await user.type(input, "not-an-email");
    await user.tab();

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Enter a valid email address.");
    expect(alert).toContainHTML("svg");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("clears the error once the value becomes valid", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <CphField
        label="Name"
        validate={(value: string) =>
          value.length < 3 ? "Too short." : true
        }
      />,
    );

    const input = screen.getByLabelText("Name");
    await user.type(input, "ab");
    await user.tab();

    expect(screen.getByRole("alert")).toHaveTextContent("Too short.");
    expect(container.querySelector(".cph-field")).toHaveAttribute("data-invalid", "true");

    await user.type(input, "cde");
    await user.tab();

    expect(screen.queryByRole("alert")).toBeNull();
    expect(container.querySelector(".cph-field")).not.toHaveAttribute("data-invalid");
  });

  it("disabled field is not editable", () => {
    render(<CphField label="Locked" isDisabled />);
    const input = screen.getByLabelText("Locked");
    expect(input).toBeDisabled();
    expect(input).not.toBeEnabled();
  });

  it("shows error role and TriangleAlert icon when invalid without validate (uses fallback)", () => {
    render(<CphField label="Required field" isRequired isInvalid />);

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toContainHTML("svg");
    expect(alert).toHaveTextContent("Enter a valid value.");
  });
});