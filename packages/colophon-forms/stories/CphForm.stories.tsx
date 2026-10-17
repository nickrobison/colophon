import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, waitFor, within } from "@storybook/test";
import { useState, type ReactElement } from "react";

import {
  CphField,
  CphForm,
  CphFormSection,
  CphStepIndicator,
  email,
  required,
  toValidator,
  type CphFormApi,
} from "../src";

interface Inquiry {
  title: string;
  contact: string;
}

const inquiry: Inquiry = { title: "", contact: "" };

const wizardSteps = [{ label: "Origin" }, { label: "Details" }, { label: "Review" }];

// Delayed so the "Saving…" window is observable instead of flashing past.
const autosave = {
  onSave: () =>
    new Promise<void>((resolve) => {
      setTimeout(resolve, 800);
    }),
};

const CphFormInquiry = CphForm<Inquiry>;

function TitleField({ form }: { form: CphFormApi<Inquiry> }): ReactElement {
  return (
    <form.Field
      name="title"
      validators={{ onBlur: toValidator(required("Give the inquiry a title.")) }}
    >
      {(field) => (
        <CphField
          id="title-field"
          label="Inquiry title"
          value={field.state.value}
          onChange={(value) => field.handleChange(value)}
          onBlur={field.handleBlur}
        />
      )}
    </form.Field>
  );
}

function ContactField({ form }: { form: CphFormApi<Inquiry> }): ReactElement {
  return (
    <form.Field
      name="contact"
      validators={{ onSubmit: toValidator(email("Contact needs an email address.")) }}
    >
      {(field) => (
        <CphField
          id="contact-field"
          label="Contact email"
          value={field.state.value}
          onChange={(value) => field.handleChange(value)}
          onBlur={field.handleBlur}
        />
      )}
    </form.Field>
  );
}

function AutosaveForm(): ReactElement {
  return (
    <CphForm<Inquiry>
      defaultValues={inquiry}
      getFieldId={(name) => `${name}-field`}
      onSubmit={() => undefined}
      autosave={autosave}
    >
      {(form) => <TitleField form={form} />}
    </CphForm>
  );
}

function ExplicitSaveForm(): ReactElement {
  return (
    <CphForm<Inquiry>
      defaultValues={inquiry}
      getFieldId={(name) => `${name}-field`}
      onSubmit={() => undefined}
      autosave={autosave}
      explicitSave
    >
      {(form) => (
        <>
          <TitleField form={form} />
          <ContactField form={form} />
        </>
      )}
    </CphForm>
  );
}

function WizardForm(): ReactElement {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const isLast = step === wizardSteps.length - 1;

  return (
    <CphForm<Inquiry>
      defaultValues={inquiry}
      getFieldId={(name) => `${name}-field`}
      onSubmit={() => {
        if (isLast) setSubmitted(true);
        else setStep((current) => current + 1);
      }}
      submitLabel={isLast ? "Submit form" : "Next"}
    >
      {(form) => (
        <>
          <CphStepIndicator steps={wizardSteps} current={step} />
          {step === 0 && (
            <CphFormSection eyebrow="Step one" title="Origin">
              <TitleField form={form} />
            </CphFormSection>
          )}
          {step === 1 && (
            <CphFormSection eyebrow="Step two" title="Details">
              <ContactField form={form} />
            </CphFormSection>
          )}
          {step === 2 && (
            <CphFormSection eyebrow="Step three" title="Review">
              <p>Origin and details are captured. Submit to send the inquiry.</p>
            </CphFormSection>
          )}
          {submitted && <p>Inquiry submitted.</p>}
        </>
      )}
    </CphForm>
  );
}

function InvalidSubmitForm(): ReactElement {
  return (
    <CphForm<Inquiry>
      defaultValues={inquiry}
      getFieldId={(name) => `${name}-field`}
      onSubmit={() => undefined}
    >
      {(form) => <TitleField form={form} />}
    </CphForm>
  );
}

const meta: Meta<typeof CphFormInquiry> = {
  title: "Colophon/Forms/CphForm",
  component: CphFormInquiry,
};
export default meta;
type S = StoryObj<typeof CphFormInquiry>;

export const WithAutosave: S = {
  render: () => <AutosaveForm />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText("Draft up to date")).toBeVisible();

    await userEvent.type(c.getByRole("textbox", { name: "Inquiry title" }), "Draft");
    await waitFor(() => expect(c.getByText("Saving…")).toBeVisible(), { timeout: 5000 });
    await waitFor(() => expect(c.getByText("Saved")).toBeVisible(), { timeout: 5000 });
  },
};

// Play-free twin of WithAutosave for the E2E suite: Storybook 8.6 always runs
// `play` in the iframe, so E2E cannot target a story that mutates itself.
export const WithAutosaveE2E: S = { render: () => <AutosaveForm /> };

export const ExplicitSaveWithError: S = {
  render: () => <ExplicitSaveForm />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await userEvent.type(c.getByRole("textbox", { name: "Inquiry title" }), "Road salt in winter");
    await expect(c.getByText("Unsaved changes")).toBeVisible();

    await userEvent.click(c.getByRole("textbox", { name: "Contact email" }));
    await userEvent.click(c.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(c.getByRole("alert")).toBeInTheDocument(), { timeout: 3000 });
    await expect(c.getByRole("alert")).toHaveTextContent("Contact needs an email address.");
    await expect(c.getByRole("link", { name: "Contact needs an email address." })).toHaveAttribute(
      "href",
      "#contact-field",
    );
    // explicitSave suppresses autosave even though it is configured.
    await expect(c.queryByText("Saving…")).not.toBeInTheDocument();
  },
};

export const ExplicitSaveWithErrorE2E: S = { render: () => <ExplicitSaveForm /> };

export const MultiStepWizard: S = {
  render: () => <WizardForm />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText("Step 1 of 3")).toBeVisible();

    await userEvent.click(c.getByRole("button", { name: "Next" }));
    await waitFor(
      () => expect(c.getByRole("alert")).toHaveTextContent("Give the inquiry a title."),
      { timeout: 3000 },
    );
    await expect(c.getByText("Step 1 of 3")).toBeVisible();

    await userEvent.type(c.getByRole("textbox", { name: "Inquiry title" }), "Ada");
    await userEvent.click(c.getByRole("button", { name: "Next" }));
    await waitFor(() => expect(c.getByText("Step 2 of 3")).toBeVisible(), { timeout: 3000 });
    await expect(c.getByRole("heading", { name: "Details" })).toBeVisible();

    await userEvent.type(c.getByRole("textbox", { name: "Contact email" }), "ada@example.com");
    await userEvent.click(c.getByRole("button", { name: "Next" }));
    await waitFor(() => expect(c.getByText("Step 3 of 3")).toBeVisible(), { timeout: 3000 });
    await expect(c.getByRole("heading", { name: "Review" })).toBeVisible();

    await userEvent.click(c.getByRole("button", { name: "Submit form" }));
    await waitFor(() => expect(c.getByText("Inquiry submitted.")).toBeVisible(), { timeout: 3000 });
  },
};

export const MultiStepWizardE2E: S = { render: () => <WizardForm /> };

export const InvalidAfterFailedSubmit: S = {
  render: () => <InvalidSubmitForm />,
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.queryByRole("alert")).not.toBeInTheDocument();

    await userEvent.click(c.getByRole("button", { name: "Save" }));
    await waitFor(
      () => expect(c.getByRole("alert")).toHaveTextContent("Give the inquiry a title."),
      { timeout: 3000 },
    );
    await expect(c.getByRole("link", { name: "Give the inquiry a title." })).toHaveAttribute(
      "href",
      "#title-field",
    );
  },
};

export const InvalidAfterFailedSubmitE2E: S = { render: () => <InvalidSubmitForm /> };
