import { render, screen } from "@testing-library/react";
import { CphFormSection } from "./CphFormSection";

describe("CphFormSection", () => {
  it("renders the eyebrow and is visible", () => {
    render(
      <CphFormSection eyebrow="Inquiry record">
        <p>body</p>
      </CphFormSection>,
    );
    const eyebrow = screen.getByText("Inquiry record");
    expect(eyebrow).toBeInTheDocument();
    expect(eyebrow).toBeVisible();
    expect(eyebrow).toHaveClass("cph-form__eyebrow");
  });

  it("renders the title when given and omits it when not", () => {
    const { unmount } = render(
      <CphFormSection eyebrow="Eyebrow" title="Section heading">
        <p>body</p>
      </CphFormSection>,
    );
    const title = screen.getByText("Section heading");
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe("H3");
    expect(title).toHaveClass("cph-form__section-title");
    unmount();

    render(
      <CphFormSection eyebrow="Eyebrow">
        <p>body</p>
      </CphFormSection>,
    );
    expect(screen.queryByText("Section heading")).not.toBeInTheDocument();
    expect(document.querySelector(".cph-form__section-title")).toBeNull();
  });

  it("renders the description when given and omits it when not", () => {
    const { unmount } = render(
      <CphFormSection eyebrow="Eyebrow" description="Some helpful text">
        <p>body</p>
      </CphFormSection>,
    );
    const desc = screen.getByText("Some helpful text");
    expect(desc).toBeInTheDocument();
    expect(desc).toHaveClass("cph-form__section-desc");
    unmount();

    render(
      <CphFormSection eyebrow="Eyebrow">
        <p>body</p>
      </CphFormSection>,
    );
    expect(screen.queryByText("Some helpful text")).not.toBeInTheDocument();
    expect(document.querySelector(".cph-form__section-desc")).toBeNull();
  });

  it("renders children inside the section body", () => {
    render(
      <CphFormSection eyebrow="Eyebrow">
        <p data-testid="child">body content</p>
      </CphFormSection>,
    );
    const body = document.querySelector(".cph-form__section-body");
    expect(body).not.toBeNull();
    expect(body).toContainElement(screen.getByTestId("child"));
  });

  it("appends the className prop to the section element", () => {
    render(
      <CphFormSection eyebrow="Eyebrow" className="cph-test-extra">
        <p>body</p>
      </CphFormSection>,
    );
    const section = document.querySelector(".cph-form__section");
    expect(section).not.toBeNull();
    expect(section).toHaveClass("cph-form__section");
    expect(section).toHaveClass("cph-test-extra");
  });
});
