import type { Key } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CphSelect } from "./CphSelect";

const options = [
  { value: "quantitative", label: "Quantitative analysis" },
  { value: "literature", label: "Literature review" },
];

describe("CphSelect", () => {
  it("renders label and accessible trigger button (happy path)", () => {
    render(<CphSelect label="Research scope" options={options} />);
    const trigger = screen.getByLabelText("Research scope");
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger).toBeVisible();
  });

  it("shows default placeholder text and overrides with custom placeholder", () => {
    const { rerender } = render(<CphSelect label="Scope" options={options} />);
    expect(screen.getByRole("button")).toHaveTextContent("Select an item");

    rerender(<CphSelect label="Scope" options={options} placeholder="Pick one…" />);
    expect(screen.getByRole("button")).toHaveTextContent("Pick one…");
  });

  it("renders help text when provided; omits when not", () => {
    const { rerender } = render(
      <CphSelect label="Scope" options={options} help="Choose carefully." />,
    );
    expect(screen.getByText("Choose carefully.")).toBeVisible();

    rerender(<CphSelect label="Scope" options={options} />);
    expect(screen.queryByText("Choose carefully.")).not.toBeInTheDocument();
  });

  it("opens popover with all options on trigger click", async () => {
    const user = userEvent.setup();
    render(<CphSelect label="Scope" options={options} />);
    const trigger = screen.getByRole("button");
    await user.click(trigger);
    expect(screen.getAllByRole("option")).toHaveLength(options.length);
  });

  it("selects an option and updates trigger text", async () => {
    const user = userEvent.setup();
    render(<CphSelect label="Scope" options={options} />);
    const trigger = screen.getByRole("button");
    await user.click(trigger);
    await user.click(screen.getByRole("option", { name: "Literature review" }));
    expect(trigger).toHaveTextContent("Literature review");
  });

  it("shows validation error when selected value is rejected", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <CphSelect
        label="Scope"
        options={options}
        validate={(value: Key) =>
          value === "literature" ? "This scope is not allowed." : true
        }
      />,
    );

    const trigger = screen.getByRole("button");
    await user.click(trigger);
    await user.click(screen.getByRole("option", { name: "Literature review" }));

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("This scope is not allowed.");
    expect(container.querySelector(".cph-field")).toHaveAttribute("data-invalid", "true");
  });

  it("renders Required and Optional markers", () => {
    const { rerender } = render(
      <CphSelect label="Scope" options={options} marker="required" />,
    );
    expect(screen.getByText("Required")).toBeVisible();

    rerender(<CphSelect label="Scope" options={options} marker="optional" />);
    expect(screen.getByText("Optional")).toBeVisible();
  });

  it("shows fallback error message when isInvalid without validate", () => {
    render(<CphSelect label="Scope" options={options} isInvalid />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Choose an option.");
    expect(alert).toContainHTML("svg");
  });

  it("invokes className callback with render props and applies the result", () => {
    const callback = vi.fn(({ isInvalid }) => (isInvalid ? "is-bad" : "is-good"));
    const { container } = render(
      <CphSelect label="Scope" options={options} className={callback} />,
    );

    expect(callback).toHaveBeenCalled();
    expect(container.querySelector(".cph-field")).toHaveClass("is-good");
  });

});
