import { render, screen } from "@testing-library/react";
import { CphErrorSummary } from "./CphErrorSummary";

describe("CphErrorSummary", () => {
  test("renders nothing when errors is empty", () => {
    const { container } = render(<CphErrorSummary errors={[]} />);
    expect(container.firstChild).toBeNull();
  });

  test("with 1 error, the heading reads '1 field needs attention'", () => {
    render(
      <CphErrorSummary
        errors={[{ fieldId: "title-field", message: "Title is required" }]}
      />,
    );
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
    render(
      <CphErrorSummary
        errors={[{ fieldId: "title-field", message: "Title is required" }]}
      />,
    );
    const section = screen.getByRole("alert");
    expect(section).toHaveAttribute("aria-labelledby", "cph-error-summary-title");
  });

  test("custom className is appended", () => {
    render(
      <CphErrorSummary
        errors={[{ fieldId: "title-field", message: "Title is required" }]}
        className="my-custom-class"
      />,
    );
    const section = screen.getByRole("alert");
    expect(section).toHaveClass("cph-error-summary");
    expect(section).toHaveClass("my-custom-class");
  });
});
