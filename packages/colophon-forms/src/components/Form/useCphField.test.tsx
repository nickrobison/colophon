import { useSelector } from "@tanstack/react-form";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";

import { CphField, minLength, required, useCphField, useCphForm } from "../../index";

interface Inquiry {
  title: string;
  contact: string;
}

const defaults: Inquiry = { title: "", contact: "" };

/**
 * Renders one hook-bound field plus its TanStack errors. The hook path has no
 * `CphErrorSummary` (that is `CphForm`'s job), so the errors come straight off
 * the field store — the same source the summary reads.
 */
function HookBoundForm(props: {
  validators?: Array<(value: string) => string | undefined>;
  validateOn?: "blur" | "change";
  onSubmit?: (values: Inquiry) => void | Promise<void>;
}): ReactElement {
  const { form } = useCphForm<Inquiry>({
    defaultValues: defaults,
    onSubmit: props.onSubmit ?? (() => undefined),
  });
  const title = useCphField(form, "title", {
    ...(props.validators ? { validators: props.validators } : {}),
    ...(props.validateOn ? { validateOn: props.validateOn } : {}),
  });
  const errors = useSelector(title.field.store, (state) => state.meta.errors);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <CphField {...title.props} label="Inquiry title" />
      {errors.length > 0 && (
        <p role="alert">
          {errors.map((error) => (typeof error === "string" ? error : "")).join(" ")}
        </p>
      )}
      <button type="submit">Submit</button>
    </form>
  );
}

describe("useCphField", () => {
  it("binds value, change, blur, and the <name>-field id convention", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <HookBoundForm validators={[required("Give the inquiry a title.")]} onSubmit={onSubmit} />,
    );

    const input = screen.getByRole("textbox", { name: "Inquiry title" });
    expect(input).toHaveAttribute("id", "title-field");

    await user.type(input, "Hello");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledExactlyOnceWith({ title: "Hello", contact: "" }),
    );
  });

  it("runs a raw validator on blur — no toValidator wrapping needed", async () => {
    const user = userEvent.setup();
    render(<HookBoundForm validators={[required("Give the inquiry a title.")]} />);

    const input = screen.getByRole("textbox", { name: "Inquiry title" });
    await user.click(input);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    await user.tab();
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Give the inquiry a title."),
    );
  });

  it("surfaces an untouched field's error at submit", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <HookBoundForm validators={[required("Give the inquiry a title.")]} onSubmit={onSubmit} />,
    );

    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Give the inquiry a title."),
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("validates on change when validateOn is change", async () => {
    const user = userEvent.setup();
    render(
      <HookBoundForm
        validators={[minLength(5, "Use at least 5 characters.")]}
        validateOn="change"
      />,
    );

    const input = screen.getByRole("textbox", { name: "Inquiry title" });
    await user.type(input, "ab");

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Use at least 5 characters."),
    );
  });

  it("runs every validator and shows each message", async () => {
    const user = userEvent.setup();
    render(<HookBoundForm validators={[() => "First failure.", () => "Second failure."]} />);

    const input = screen.getByRole("textbox", { name: "Inquiry title" });
    await user.click(input);
    await user.tab();

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent("First failure.");
      expect(alert).toHaveTextContent("Second failure.");
    });
  });

  it("submits cleanly when no validators are supplied", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<HookBoundForm onSubmit={onSubmit} />);

    await user.type(screen.getByRole("textbox", { name: "Inquiry title" }), "Anything");
    await user.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
