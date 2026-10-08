import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState, type ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

import { CphDateField, type CphDateValue } from "../components/DateField/CphDateField";
import { CphField } from "../components/Field/CphField";
import { CphForm, toValidator, type CphFormApi } from "../components/Form/CphForm";
import {
  CPH_AUTOSAVE_DEBOUNCE_MS,
  CPH_AUTOSAVE_RECEIPT_MS,
} from "../components/Form/useCphAutosave";
import { CphFormSection } from "../components/FormSection/CphFormSection";
import { CphStepIndicator } from "../components/StepIndicator/CphStepIndicator";
import { dateRange, required } from "../validation/validators";

interface WizardValues {
  name: string;
  details: string;
}

const wizardSteps = [{ label: "Identity" }, { label: "Details" }] as const;

const blurValidator = { onBlur: toValidator(required("Title is required.")) };

function WizardNameField({ form }: { form: CphFormApi<WizardValues> }): ReactElement {
  return (
    <form.Field name="name" validators={{ onBlur: toValidator(required("Enter your name.")) }}>
      {(field) => (
        <CphField
          id="name-field"
          label="Name"
          value={field.state.value}
          onChange={(value) => field.handleChange(value)}
          onBlur={field.handleBlur}
        />
      )}
    </form.Field>
  );
}

function WizardDetailsField({ form }: { form: CphFormApi<WizardValues> }): ReactElement {
  return (
    <form.Field name="details" validators={{ onBlur: toValidator(required("Enter the details.")) }}>
      {(field) => (
        <CphField
          id="details-field"
          label="Details"
          value={field.state.value}
          onChange={(value) => field.handleChange(value)}
          onBlur={field.handleBlur}
        />
      )}
    </form.Field>
  );
}

interface TitleValues {
  title: string;
}

function TitleField({
  form,
  validateOnBlur = false,
}: {
  form: CphFormApi<TitleValues>;
  validateOnBlur?: boolean;
}): ReactElement {
  if (!validateOnBlur) {
    return (
      <form.Field name="title">
        {(field) => (
          <CphField
            id="title-field"
            label="Title"
            value={field.state.value}
            onChange={(value) => field.handleChange(value)}
            onBlur={field.handleBlur}
          />
        )}
      </form.Field>
    );
  }

  return (
    <form.Field name="title" validators={blurValidator}>
      {(field) => (
        <CphField
          id="title-field"
          label="Title"
          value={field.state.value}
          onChange={(value) => field.handleChange(value)}
          onBlur={field.handleBlur}
        />
      )}
    </form.Field>
  );
}

function WizardHarness({ onSubmit }: { onSubmit: (values: WizardValues) => void }): ReactElement {
  const [step, setStep] = useState(0);

  return (
    <CphForm<WizardValues>
      defaultValues={{ name: "", details: "" }}
      getFieldId={(name) => `${name}-field`}
      onSubmit={(values) => {
        if (step < wizardSteps.length - 1) {
          setStep((current) => current + 1);
        } else {
          onSubmit(values);
        }
      }}
      submitLabel={step < wizardSteps.length - 1 ? "Next" : "Submit form"}
    >
      {(form) => (
        <>
          <CphStepIndicator steps={wizardSteps} current={step} />
          {step === 0 ? (
            <CphFormSection eyebrow="Step one" title="Identity">
              <WizardNameField form={form} />
            </CphFormSection>
          ) : (
            <CphFormSection eyebrow="Step two" title="Details">
              <WizardDetailsField form={form} />
            </CphFormSection>
          )}
        </>
      )}
    </CphForm>
  );
}

describe("CphForm integration", () => {
  it("marks a date field touched and links its blur validation error to the field", async () => {
    const user = userEvent.setup();
    const message = "Start date is required.";
    const onBlur = vi.fn(({ value }: { value: CphDateValue }) =>
      value === null ? message : undefined,
    );
    const { container } = render(
      <CphForm<{ start: CphDateValue }>
        defaultValues={{ start: null }}
        getFieldId={(name) => `${name}-field`}
        onSubmit={() => undefined}
      >
        {(form) => (
          <form.Field name="start" validators={{ onBlur }}>
            {(field) => (
              <>
                <CphDateField
                  id="start-field"
                  label="Start date"
                  value={field.state.value}
                  onChange={field.handleChange}
                  onBlur={field.handleBlur}
                />
                <output>{field.state.meta.isTouched ? "Touched" : "Untouched"}</output>
              </>
            )}
          </form.Field>
        )}
      </CphForm>,
    );

    expect(screen.getByText("Untouched")).toBeVisible();
    expect(onBlur).not.toHaveBeenCalled();
    await user.click(screen.getByRole("spinbutton", { name: /year/i }));
    await user.tab();

    expect(screen.getByText("Touched")).toBeVisible();
    expect(onBlur).toHaveBeenCalled();
    const errorLink = await screen.findByRole("link", { name: message });
    expect(errorLink).toHaveAttribute("href", "#start-field");
    const target = container.querySelector(errorLink.getAttribute("href")!);
    expect(target).not.toBeNull();
    expect(target).toContainElement(screen.getByRole("spinbutton", { name: /year/i }));
  });

  it("keeps an invalid wizard step in place, then submits the completed final step", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<WizardHarness onSubmit={onSubmit} />);

    expect(screen.getByText("Step 1 of 2")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Next" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Enter your name."));
    expect(screen.getByText("Step 1 of 2")).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();

    await user.type(screen.getByRole("textbox", { name: "Name" }), "Ada");
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText("Step 2 of 2")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Details" })).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Submit form" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Enter the details."));
    expect(onSubmit).not.toHaveBeenCalled();

    await user.type(screen.getByRole("textbox", { name: "Details" }), "A biography");
    await user.click(screen.getByRole("button", { name: "Submit form" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({ name: "Ada", details: "A biography" });
  });

  it("marks the first wizard step complete after advancing to the second step", async () => {
    const user = userEvent.setup();
    render(<WizardHarness onSubmit={() => undefined} />);

    await user.type(screen.getByRole("textbox", { name: "Name" }), "Ada");
    await user.click(screen.getByRole("button", { name: "Next" }));

    const steps = screen.getAllByRole("listitem");
    expect(steps[0]).toHaveClass("cph-steps__item--complete");
    expect(steps[1]).toHaveAttribute("aria-current", "step");
  });

  it("transitions autosave from idle to saving to saved and back to idle", async () => {
    const user = userEvent.setup();
    let resolveSave!: () => void;
    const onSave = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSave = resolve;
        }),
    );
    render(
      <CphForm<TitleValues>
        defaultValues={{ title: "" }}
        getFieldId={(name) => `${name}-field`}
        onSubmit={() => undefined}
        autosave={{ onSave }}
      >
        {(form) => <TitleField form={form} />}
      </CphForm>,
    );

    expect(screen.getByText("Draft up to date")).toBeVisible();
    await user.type(screen.getByRole("textbox", { name: "Title" }), "Draft");
    await waitFor(() => expect(screen.getByText("Saving…")).toBeVisible(), {
      timeout: CPH_AUTOSAVE_DEBOUNCE_MS * 4,
    });
    expect(onSave).toHaveBeenCalledWith({ title: "Draft" });

    resolveSave();
    await waitFor(() => expect(screen.getByText("Saved")).toBeVisible());
    await waitFor(() => expect(screen.queryByText("Saved")).not.toBeInTheDocument(), {
      timeout: CPH_AUTOSAVE_RECEIPT_MS * 2,
    });
    expect(screen.getByText("Unsaved changes")).toBeVisible();
  });

  it("surfaces a rejected autosave through the save indicator", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockRejectedValue(new Error("Autosave failed."));
    render(
      <CphForm<TitleValues>
        defaultValues={{ title: "" }}
        onSubmit={() => undefined}
        autosave={{ onSave }}
      >
        {(form) => <TitleField form={form} />}
      </CphForm>,
    );

    await user.type(screen.getByRole("textbox", { name: "Title" }), "Draft");
    await waitFor(() => expect(screen.getByText("Autosave failed.")).toBeVisible(), {
      timeout: CPH_AUTOSAVE_DEBOUNCE_MS * 4,
    });
  });

  it("autosaves the latest value after multiple changes settle", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <CphForm<TitleValues>
        defaultValues={{ title: "" }}
        onSubmit={() => undefined}
        autosave={{ onSave }}
      >
        {(form) => <TitleField form={form} />}
      </CphForm>,
    );

    const input = screen.getByRole("textbox", { name: "Title" });
    await user.type(input, "Draft");
    await user.clear(input);
    await user.type(input, "Final draft");

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1), {
      timeout: CPH_AUTOSAVE_DEBOUNCE_MS * 4,
    });
    expect(onSave).toHaveBeenCalledWith({ title: "Final draft" });
  });

  it("shows a blurred field error in the summary and clears it after correction", async () => {
    const user = userEvent.setup();
    render(
      <CphForm<{ title: string }>
        defaultValues={{ title: "" }}
        getFieldId={(name) => `${name}-field`}
        onSubmit={() => undefined}
      >
        {(form) => <TitleField form={form} validateOnBlur />}
      </CphForm>,
    );

    const input = screen.getByRole("textbox", { name: "Title" });
    await user.click(input);
    await user.tab();
    const errorLink = await screen.findByRole("link", { name: "Title is required." });
    expect(errorLink).toHaveAttribute("href", "#title-field");
    expect(screen.getByRole("alert")).toHaveTextContent("Title is required.");

    await user.type(input, "A title");
    await user.tab();
    await waitFor(() =>
      expect(screen.queryByRole("link", { name: "Title is required." })).not.toBeInTheDocument(),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("rejects an end date before the start date with a cross-field rule", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const message = "End date must not be before start date.";
    render(
      <CphForm<{ start: string; end: string }>
        defaultValues={{ start: "", end: "" }}
        getFieldId={(name) => `${name}-field`}
        onSubmit={onSubmit}
        validators={{
          onSubmit: ({ value }) => dateRange(value.start, message)(value.end),
        }}
      >
        {(form) => (
          <>
            <CphField
              id="start-field"
              label="Start date"
              value={form.getFieldValue("start")}
              onChange={(value) => form.setFieldValue("start", value)}
            />
            <CphField
              id="end-field"
              label="End date"
              value={form.getFieldValue("end")}
              onChange={(value) => form.setFieldValue("end", value)}
            />
          </>
        )}
      </CphForm>,
    );

    await user.type(screen.getByRole("textbox", { name: "Start date" }), "2026-05-10");
    await user.type(screen.getByRole("textbox", { name: "End date" }), "2026-05-09");
    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(message));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits when the end date is on or after the start date", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <CphForm<{ start: string; end: string }>
        defaultValues={{ start: "", end: "" }}
        onSubmit={onSubmit}
        validators={{ onSubmit: ({ value }) => dateRange(value.start)(value.end) }}
      >
        {(form) => (
          <>
            <CphField
              id="start-field"
              label="Start date"
              value={form.getFieldValue("start")}
              onChange={(value) => form.setFieldValue("start", value)}
            />
            <CphField
              id="end-field"
              label="End date"
              value={form.getFieldValue("end")}
              onChange={(value) => form.setFieldValue("end", value)}
            />
          </>
        )}
      </CphForm>,
    );

    await user.type(screen.getByRole("textbox", { name: "Start date" }), "2026-05-10");
    await user.type(screen.getByRole("textbox", { name: "End date" }), "2026-05-11");
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ start: "2026-05-10", end: "2026-05-11" }),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("never autosaves an explicit-save form and persists only on submit", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onSubmit = vi.fn();
    render(
      <CphForm<TitleValues>
        defaultValues={{ title: "" }}
        onSubmit={onSubmit}
        autosave={{ onSave }}
        explicitSave
      >
        {(form) => <TitleField form={form} />}
      </CphForm>,
    );

    await user.type(screen.getByRole("textbox", { name: "Title" }), "Manual draft");
    await new Promise((resolve) => setTimeout(resolve, CPH_AUTOSAVE_DEBOUNCE_MS * 2));
    expect(onSave).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ title: "Manual draft" }));
    expect(onSave).not.toHaveBeenCalled();
  });
});
