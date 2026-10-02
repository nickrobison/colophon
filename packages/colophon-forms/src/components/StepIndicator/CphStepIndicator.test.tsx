import { render, screen } from "@testing-library/react";
import { CphStepIndicator } from "./CphStepIndicator";

const steps = [
  { label: "Personal" },
  { label: "Details" },
  { label: "Confirm" },
];

describe("CphStepIndicator", () => {
  test("renders a nav labelled 'Form progress' with an ordered list of the steps", () => {
    render(<CphStepIndicator steps={steps} current={0} />);

    const nav = screen.getByRole("navigation", { name: "Form progress" });
    expect(nav).toBeInTheDocument();

    const list = nav.querySelector("ol.cph-steps__list");
    expect(list).not.toBeNull();

    const items = Array.from(list!.querySelectorAll("li.cph-steps__item"));
    expect(items).toHaveLength(3);
    expect(items[0]!.textContent).toContain("Personal");
    expect(items[1]!.textContent).toContain("Details");
    expect(items[2]!.textContent).toContain("Confirm");
  });

  test("the count text reads 'Step 2 of 3' when current={1} with 3 steps", () => {
    render(<CphStepIndicator steps={steps} current={1} />);

    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
  });

  test("the current step carries aria-current='step'", () => {
    render(<CphStepIndicator steps={steps} current={1} />);

    const items = screen.getAllByRole("listitem");
    expect(items[1]!).toHaveAttribute("aria-current", "step");
    expect(items[0]!).not.toHaveAttribute("aria-current");
    expect(items[2]!).not.toHaveAttribute("aria-current");
  });

  test("steps before current carry cph-steps__item--complete", () => {
    render(<CphStepIndicator steps={steps} current={1} />);

    const items = screen.getAllByRole("listitem");
    expect(items[0]!).toHaveClass("cph-steps__item--complete");
    expect(items[1]!).not.toHaveClass("cph-steps__item--complete");
    expect(items[2]!).not.toHaveClass("cph-steps__item--complete");
  });

  test("steps after current carry neither the complete nor current modifier", () => {
    render(<CphStepIndicator steps={steps} current={1} />);

    const items = screen.getAllByRole("listitem");
    expect(items[2]!).not.toHaveClass("cph-steps__item--complete");
    expect(items[2]!).not.toHaveClass("cph-steps__item--current");
  });

  test("the current step's accessible text is its label (each li reads e.g. '2 Details')", () => {
    render(<CphStepIndicator steps={steps} current={1} />);

    const items = screen.getAllByRole("listitem");
    expect(items[0]!).toHaveTextContent("Personal");
    expect(items[1]!).toHaveTextContent("Details");
    expect(items[2]!).toHaveTextContent("Confirm");
  });
});
