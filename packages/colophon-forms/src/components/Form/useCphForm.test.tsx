import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { CphField, CPH_AUTOSAVE_DEBOUNCE_MS, toValidator, required, useCphForm } from "../../index";

interface Inquiry {
  title: string;
  contact: string;
}

const defaults: Inquiry = { title: "", contact: "" };

function HookHarness(props: {
  onSubmit?: (values: Inquiry) => void | Promise<void>;
  schema?: Parameters<typeof useCphForm<Inquiry>>[0]["schema"];
  validators?: Parameters<typeof useCphForm<Inquiry>>[0]["validators"];
  autosave?: { onSave: (values: Inquiry) => void | Promise<void> };
  explicitSave?: boolean;
}): ReactElement {
  const { form, autosave } = useCphForm<Inquiry>({
    defaultValues: defaults,
    onSubmit: props.onSubmit ?? (() => undefined),
    ...(props.schema ? { schema: props.schema } : {}),
    ...(props.validators ? { validators: props.validators } : {}),
    ...(props.autosave ? { autosave: props.autosave } : {}),
    ...(props.explicitSave ? { explicitSave: props.explicitSave } : {}),
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.Field
        name="title"
        validators={{ onBlur: toValidator(required("Give the inquiry a title.")) }}
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
      <span data-testid="save-state">{autosave.state}</span>
      <button type="submit">Submit</button>
    </form>
  );
}

describe("useCphForm", () => {
  it("returns a form api that submits the entered values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<HookHarness onSubmit={onSubmit} />);

    await user.type(screen.getByRole("textbox", { name: "Inquiry title" }), "Hello");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith({ title: "Hello", contact: "" }),
    );
  });

  it("blocks submit when the schema fails but still runs the inline validator", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const inline = vi.fn(() => undefined);
    render(
      <HookHarness
        onSubmit={onSubmit}
        schema={z
          .object({ title: z.string(), contact: z.string() })
          .refine(() => false, "Schema cross-field failed.")}
        validators={{ onSubmit: inline }}
      />,
    );

    await user.type(screen.getByRole("textbox", { name: "Inquiry title" }), "Hello");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(inline).toHaveBeenCalled());
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits once the schema passes", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <HookHarness
        onSubmit={onSubmit}
        schema={z.object({
          title: z.string().min(3, "Schema needs at least 3 characters."),
          contact: z.string(),
        })}
      />,
    );

    const input = screen.getByRole("textbox", { name: "Inquiry title" });
    await user.type(input, "ab");
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());

    await user.clear(input);
    await user.type(input, "valid");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith({ title: "valid", contact: "" }),
    );
  });

  it("autosaves after the debounce and reports the saved state", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<HookHarness autosave={{ onSave }} />);

    await user.type(screen.getByRole("textbox", { name: "Inquiry title" }), "Draft");

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1), {
      timeout: CPH_AUTOSAVE_DEBOUNCE_MS * 6,
    });
    expect(onSave).toHaveBeenCalledWith({ title: "Draft", contact: "" });
    await waitFor(() => expect(screen.getByTestId("save-state")).toHaveTextContent("saved"));
  });

  it("suppresses autosave when explicitSave is set", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<HookHarness autosave={{ onSave }} explicitSave />);

    await user.type(screen.getByRole("textbox", { name: "Inquiry title" }), "Draft");

    await new Promise((resolve) => setTimeout(resolve, CPH_AUTOSAVE_DEBOUNCE_MS * 4));
    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByTestId("save-state")).toHaveTextContent("idle");
  });

  it("keeps the save state idle when no autosave is supplied", async () => {
    const user = userEvent.setup();
    render(<HookHarness />);

    await user.type(screen.getByRole("textbox", { name: "Inquiry title" }), "Draft");

    await new Promise((resolve) => setTimeout(resolve, CPH_AUTOSAVE_DEBOUNCE_MS * 2));
    expect(screen.getByTestId("save-state")).toHaveTextContent("idle");
  });
});
