import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

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
        validate={(value: string) =>
          value.length < 3 ? "Too short." : true
        }
      />,
    );

    const textarea = screen.getByLabelText("Notes");
    await user.type(textarea, "ab");
    await user.tab();

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Too short.");
    expect(alert).toContainHTML("svg");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
  });

  it("clears the error once the value becomes valid", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <CphTextarea
        label="Notes"
        validate={(value: string) =>
          value.length < 3 ? "Too short." : true
        }
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

  it("preserves typed value while the error shows", async () => {
    const user = userEvent.setup();
    render(
      <CphTextarea
        label="Notes"
        validate={(value: string) =>
          value.length < 3 ? "Too short." : true
        }
      />,
    );

    const textarea = screen.getByLabelText("Notes");
    await user.type(textarea, "ab");
    await user.tab();

    expect(screen.getByRole("alert")).toHaveTextContent("Too short.");
    expect(textarea).toHaveValue("ab");
  });
});
