import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import {
  email,
  minLength,
  required,
  CphField,
  CphForm,
  toValidator,
  type CphFormApi,
  CPH_AUTOSAVE_DEBOUNCE_MS,
  CPH_AUTOSAVE_RECEIPT_MS,
} from "../../index";

interface Inquiry {
  title: string;
  contact: string;
}

const defaults: Inquiry = { title: "", contact: "" };

function TitleField({ form }: { form: CphFormApi<Inquiry> }): ReactElement {
  return (
    <form.Field
      name="title"
      validators={{
        onBlur: toValidator(required("Give the inquiry a title.")),
      }}
    >
      {(field) => (
        <CphField
          id="title-field"
          label="Inquiry title"
          value={field.state.value}
          onChange={field.handleChange}
          onBlur={field.handleBlur}
        />
      )}
    </form.Field>
  );
}

function Harness(props: {
  onSubmit?: (values: Inquiry) => void | Promise<void>;
  autosave?: { onSave: (values: Inquiry) => void | Promise<void> };
  explicitSave?: boolean;
  hideErrorSummary?: boolean;
  schema?: z.ZodType<Inquiry>;
  children?: (form: CphFormApi<Inquiry>) => ReactElement;
}): ReactElement {
  const { onSubmit = () => undefined, children } = props;
  return (
    <CphForm<Inquiry>
      defaultValues={defaults}
      onSubmit={onSubmit}
      getFieldId={(name) => `${name}-field`}
      {...(props.autosave ? { autosave: props.autosave } : {})}
      {...(props.explicitSave !== undefined ? { explicitSave: props.explicitSave } : {})}
      {...(props.hideErrorSummary !== undefined
        ? { hideErrorSummary: props.hideErrorSummary }
        : {})}
      {...(props.schema ? { schema: props.schema } : {})}
    >
      {children ?? ((form) => <TitleField form={form} />)}
    </CphForm>
  );
}

async function submitForm(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /save/i }));
}

describe("CphForm", () => {
  it("invokes onSubmit with the entered values when validation passes", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);

    await user.type(screen.getByRole("textbox", { name: "Inquiry title" }), "Hello");
    await submitForm(user);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({ title: "Hello", contact: "" });
  });

  it("blocks submit and lists the failing field when a field is invalid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Harness onSubmit={onSubmit} />);

    await user.click(screen.getByRole("textbox", { name: "Inquiry title" }));
    await user.tab();
    await submitForm(user);

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Give the inquiry a title."),
    );
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("link", { name: "Give the inquiry a title." })).toHaveAttribute(
      "href",
      "#title-field",
    );
  });

  it("runs onBlur validation only after the field is blurred", async () => {
    const user = userEvent.setup();
    render(
      <CphForm<Inquiry>
        defaultValues={defaults}
        onSubmit={() => undefined}
        getFieldId={(name) => `${name}-field`}
      >
        {(form) => (
          <form.Field
            name="title"
            validators={{ onBlur: toValidator(minLength(5, "Use at least 5 characters.")) }}
          >
            {(field) => (
              <CphField
                id="title-field"
                label="Inquiry title"
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
              />
            )}
          </form.Field>
        )}
      </CphForm>,
    );
    const input = screen.getByRole("textbox", { name: "Inquiry title" });

    await user.click(input);
    await user.type(input, "ab");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    await user.tab();
    await waitFor(() => expect(screen.getByRole("alert")).toBeVisible());
  });

  it("validates with a Zod schema and reports its message", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const schema = z.object({
      title: z.string().min(3, "Schema needs at least 3 characters."),
      contact: z.string(),
    });
    render(<Harness onSubmit={onSubmit} schema={schema} />);

    await user.type(screen.getByRole("textbox", { name: "Inquiry title" }), "ab");
    await submitForm(user);

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Schema needs at least 3 characters."),
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("surfaces a form-level validator message for a field with no rule", async () => {
    const user = userEvent.setup();
    render(
      <CphForm<Inquiry>
        defaultValues={defaults}
        onSubmit={() => undefined}
        validators={{
          onSubmit: ({ value }) => email("Contact needs an email address.")(value.contact),
        }}
      >
        {() => <span>no fields</span>}
      </CphForm>,
    );

    await submitForm(user);
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Contact needs an email address."),
    );
  });

  it.each([
    ["string", "Form needs attention."],
    ["form object", { form: "Form needs attention." }],
    ["nested form object", { form: { form: "Form needs attention." } }],
  ])("gives each form its own summary anchor for a %s error", async (_shape, error) => {
    const user = userEvent.setup();
    const { container } = render(
      <>
        {[0, 1].map((key) => (
          <CphForm<Inquiry>
            key={key}
            defaultValues={defaults}
            onSubmit={() => undefined}
            validators={{ onSubmit: () => error }}
          >
            {() => <span>no fields</span>}
          </CphForm>
        ))}
      </>,
    );
    const anchors = Array.from(container.querySelectorAll(".cph-form > div[id]"));
    const anchorIds = anchors.map((anchor) => anchor.id);
    expect(anchors).toHaveLength(2);
    expect(new Set(anchorIds).size).toBe(2);

    const buttons = screen.getAllByRole("button", { name: "Save" });
    await user.click(buttons[0]!);
    await user.click(buttons[1]!);
    await waitFor(() => expect(screen.getAllByRole("alert")).toHaveLength(2));

    for (const [index, summary] of screen.getAllByRole("alert").entries()) {
      const link = within(summary).getByRole("link", { name: "Form needs attention." });
      expect(link).toHaveAttribute("href", `#${anchorIds[index]}`);
      expect(document.getElementById(link.getAttribute("href")!.slice(1))).toBe(anchors[index]);
      expect(anchors[index]).toContainElement(summary);
      expect(anchors[index]).toHaveAttribute("tabindex", "-1");
    }

    const ids = Array.from(document.querySelectorAll("[id]"), (element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps its summary anchor stable when the summary is hidden and shown", () => {
    const { container, rerender } = render(<Harness hideErrorSummary />);
    expect(container.querySelector(".cph-form > div[id]")).toBeNull();

    rerender(<Harness hideErrorSummary={false} />);
    const anchorId = container.querySelector(".cph-form > div[id]")?.id;
    expect(anchorId).toBeTruthy();

    rerender(<Harness hideErrorSummary />);
    expect(container.querySelector(".cph-form > div[id]")).toBeNull();

    rerender(<Harness hideErrorSummary={false} />);
    expect(container.querySelector(".cph-form > div[id]")).toHaveAttribute("id", anchorId);
  });

  it("autosaves after the debounce and cycles back to idle after the receipt", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<Harness autosave={{ onSave }} />);

    await user.type(screen.getByRole("textbox", { name: "Inquiry title" }), "Draft");

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1), {
      timeout: CPH_AUTOSAVE_DEBOUNCE_MS * 6,
    });
    expect(onSave).toHaveBeenCalledWith({ title: "Draft", contact: "" });
    await waitFor(() => expect(screen.getByText("Saved")).toBeVisible());

    await waitFor(() => expect(screen.queryByText("Saved")).not.toBeInTheDocument(), {
      timeout: CPH_AUTOSAVE_RECEIPT_MS * 4,
    });
  });

  it("coalesces rapid typing into a single autosave", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<Harness autosave={{ onSave }} />);

    const input = screen.getByRole("textbox", { name: "Inquiry title" });
    await user.type(input, "a");
    await user.type(input, "b");
    await user.type(input, "c");

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1), {
      timeout: CPH_AUTOSAVE_DEBOUNCE_MS * 6,
    });
    expect(onSave).toHaveBeenCalledWith({ title: "abc", contact: "" });
  });

  it("does not autosave when explicitSave is set", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<Harness autosave={{ onSave }} explicitSave />);

    await user.type(screen.getByRole("textbox", { name: "Inquiry title" }), "Draft");

    await new Promise((resolve) => setTimeout(resolve, CPH_AUTOSAVE_DEBOUNCE_MS * 4));
    expect(onSave).not.toHaveBeenCalled();
  });

  it("reports a rejected autosave and surfaces the failure message", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockRejectedValue(new Error("Network unreachable"));
    render(<Harness autosave={{ onSave }} />);

    await user.type(screen.getByRole("textbox", { name: "Inquiry title" }), "Draft");

    await waitFor(() => expect(screen.getByText("Network unreachable")).toBeVisible(), {
      timeout: CPH_AUTOSAVE_DEBOUNCE_MS * 6,
    });
  });

  it("reports a synchronously thrown autosave error instead of staying in saving", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockImplementation(() => {
      throw new Error("Sync error");
    });
    render(<Harness autosave={{ onSave }} />);

    await user.type(screen.getByRole("textbox", { name: "Inquiry title" }), "Draft");

    await waitFor(() => expect(screen.getByText("Sync error")).toBeVisible(), {
      timeout: CPH_AUTOSAVE_DEBOUNCE_MS * 6,
    });
  });

  it("unmounts mid-debounce without warning or a stray save", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    const warn = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const { unmount } = render(<Harness autosave={{ onSave }} />);
    await user.type(screen.getByRole("textbox", { name: "Inquiry title" }), "Draft");
    unmount();

    await new Promise((resolve) => setTimeout(resolve, CPH_AUTOSAVE_DEBOUNCE_MS * 4));
    expect(onSave).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it("reports dirty state and toggles the submit button while submitting", async () => {
    const user = userEvent.setup();
    let release: (() => void) | undefined;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );
    render(<Harness onSubmit={onSubmit} />);

    expect(screen.getByText("Draft up to date")).toBeVisible();

    await user.type(screen.getByRole("textbox", { name: "Inquiry title" }), "Hello");
    await waitFor(() => expect(screen.getByText("Unsaved changes")).toBeVisible());

    await submitForm(user);
    await waitFor(() => expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled());

    release?.();
    await waitFor(() => expect(screen.getByRole("button", { name: /save/i })).toBeEnabled());
  });

  it("renders the footer Back affordance only when onDiscard is supplied", async () => {
    const onDiscard = vi.fn();
    const { rerender } = render(<Harness />);
    expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();

    rerender(
      <CphForm<Inquiry> defaultValues={defaults} onSubmit={() => undefined} onDiscard={onDiscard}>
        {() => <span>fields</span>}
      </CphForm>,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(onDiscard).toHaveBeenCalledTimes(1);
  });
});
