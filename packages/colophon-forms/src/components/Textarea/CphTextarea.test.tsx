import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CphTextarea } from "./CphTextarea";

describe("CphTextarea", () => {
  it("renders label and accessible textbox (happy path)", () => {
    render(<CphTextarea label="Inquiry details" />);
    expect(screen.getByLabelText("Inquiry details")).toBeVisible();
    expect(screen.getByRole("textbox")).toBeVisible();
  });

  it("renders rows attribute and defaults to 5", () => {
    const { rerender } = render(<CphTextarea label="Notes" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("rows", "5");

    rerender(<CphTextarea label="Notes" rows={8} />);
    expect(screen.getByRole("textbox")).toHaveAttribute("rows", "8");
  });

  it("renders help text when provided; omits when not", () => {
    const { rerender } = render(<CphTextarea label="Notes" help="Max 500 characters." />);
    expect(screen.getByText("Max 500 characters.")).toBeVisible();

    rerender(<CphTextarea label="Notes" />);
    expect(screen.queryByText("Max 500 characters.")).not.toBeInTheDocument();
  });

  it("exposes help as the textarea's accessible description", () => {
    render(<CphTextarea label="Notes" help="Max 500 characters." />);
    expect(screen.getByRole("textbox", { name: "Notes" })).toHaveAccessibleDescription(
      "Max 500 characters.",
    );
  });

  it("renders Required and Optional markers", () => {
    const { rerender } = render(<CphTextarea label="Body" marker="required" />);
    expect(screen.getByText("Required")).toBeVisible();

    rerender(<CphTextarea label="Body" marker="optional" />);
    expect(screen.getByText("Optional")).toBeVisible();
  });

  it("shows the validate message with icon and aria-invalid on an invalid value", async () => {
    const user = userEvent.setup();
    render(
      <CphTextarea
        label="Notes"
        validate={(value: string) => (value.length < 3 ? "Too short." : true)}
      />,
    );

    const textarea = screen.getByLabelText("Notes");
    await user.type(textarea, "ab");
    await user.tab();

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Too short.");
    expect(alert).toContainHTML("svg");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAccessibleDescription("Too short.");
  });

  it("clears the error once the value becomes valid", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <CphTextarea
        label="Notes"
        validate={(value: string) => (value.length < 3 ? "Too short." : true)}
      />,
    );

    const textarea = screen.getByLabelText("Notes");
    await user.type(textarea, "ab");
    await user.tab();

    expect(screen.getByRole("alert")).toHaveTextContent("Too short.");
    expect(container.querySelector(".cph-field")).toHaveAttribute("data-invalid", "true");

    await user.type(textarea, "cde");
    await user.tab();

    expect(screen.queryByRole("alert")).toBeNull();
    expect(container.querySelector(".cph-field")).not.toHaveAttribute("data-invalid");
  });

  it("disabled textarea is not editable", () => {
    render(<CphTextarea label="Locked" isDisabled />);
    const textarea = screen.getByLabelText("Locked");
    expect(textarea).toBeDisabled();
    expect(textarea).not.toBeEnabled();
  });

  it("shows fallback error message when isInvalid without validate", () => {
    render(<CphTextarea label="Notes" isInvalid />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Enter a valid value.");
    expect(alert).toContainHTML("svg");
    expect(screen.getByRole("textbox", { name: "Notes" })).toHaveAccessibleDescription(
      "Enter a valid value.",
    );
  });

  it("preserves typed value while the error shows", async () => {
    const user = userEvent.setup();
    render(
      <CphTextarea
        label="Notes"
        validate={(value: string) => (value.length < 3 ? "Too short." : true)}
      />,
    );

    const textarea = screen.getByLabelText("Notes");
    await user.type(textarea, "ab");
    await user.tab();

    expect(screen.getByRole("alert")).toHaveTextContent("Too short.");
    expect(textarea).toHaveValue("ab");
  });

  it("invokes className callback with render props and applies the result", () => {
    const callback = vi.fn(({ isInvalid }) => (isInvalid ? "is-bad" : "is-good"));
    const { container } = render(<CphTextarea label="Test" className={callback} />);

    expect(callback).toHaveBeenCalled();
    expect(container.querySelector(".cph-field")).toHaveClass("is-good");
  });
});
