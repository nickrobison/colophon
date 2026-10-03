import { render, screen } from "@testing-library/react";

import { CphErrorSummary } from "./CphErrorSummary";

describe("CphErrorSummary", () => {
  test("renders nothing when errors is empty", () => {
    const { container } = render(<CphErrorSummary errors={[]} />);
    expect(container.firstChild).toBeNull();
  });

  test("with 1 error, the heading reads '1 field needs attention'", () => {
    render(<CphErrorSummary errors={[{ fieldId: "title-field", message: "Title is required" }]} />);
    expect(screen.getByText("1 field needs attention")).toBeInTheDocument();
  });

  test("with 3 errors, the heading reads '3 fields need attention'", () => {
    render(
      <CphErrorSummary
        errors={[
          { fieldId: "title-field", message: "Title is required" },
          { fieldId: "body-field", message: "Body is required" },
          { fieldId: "author-field", message: "Author is required" },
        ]}
      />,
    );
    expect(screen.getByText("3 fields need attention")).toBeInTheDocument();
  });

  test("each error message renders as a link whose href is #<fieldId>", () => {
    render(
      <CphErrorSummary
        errors={[
          { fieldId: "title-field", message: "Title is required" },
          { fieldId: "body-field", message: "Body is required" },
        ]}
      />,
    );
    const titleLink = screen.getByText("Title is required");
    const bodyLink = screen.getByText("Body is required");
    expect(titleLink).toHaveAttribute("href", "#title-field");
    expect(bodyLink).toHaveAttribute("href", "#body-field");
  });

  test("role='alert' and aria-labelledby are present", () => {
    render(<CphErrorSummary errors={[{ fieldId: "title-field", message: "Title is required" }]} />);
    const section = screen.getByRole("alert");
    // The heading id is generated per instance, so assert the reference
    // resolves to this summary's own heading rather than a fixed string.
    const heading = screen.getByRole("heading", { level: 3 });
    expect(section).toHaveAttribute("aria-labelledby", heading.id);
  });

  test("two summaries each label themselves, not the first one on the page", () => {
    render(
      <>
        <CphErrorSummary errors={[{ fieldId: "a-field", message: "First problem" }]} />
        <CphErrorSummary
          errors={[
            { fieldId: "b-field", message: "Second problem" },
            { fieldId: "c-field", message: "Third problem" },
          ]}
        />
      </>,
    );

    const sections = screen.getAllByRole("alert");
    expect(sections).toHaveLength(2);

    const first = sections[0]!;
    const second = sections[1]!;
    expect(first.getAttribute("aria-labelledby")).not.toBe(second.getAttribute("aria-labelledby"));
    expect(first).toHaveAccessibleName("1 field needs attention");
    expect(second).toHaveAccessibleName("2 fields need attention");
  });

  test("custom className is appended", () => {
    render(
      <CphErrorSummary
        errors={[{ fieldId: "title-field", message: "Title is required" }]}
        className="cph-test-extra"
      />,
    );
    const section = screen.getByRole("alert");
    expect(section).toHaveClass("cph-error-summary");
    expect(section).toHaveClass("cph-test-extra");
  });
});
