import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CphFormActions } from "./CphFormActions";

describe("CphFormActions", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("draft status reads 'Unsaved changes' when isDirty", () => {
    render(<CphFormActions isDirty />);
    expect(screen.getByText("Unsaved changes")).toBeVisible();
  });

  it("draft status reads 'Draft up to date' when not dirty", () => {
    render(<CphFormActions isDirty={false} />);
    expect(screen.getByText("Draft up to date")).toBeVisible();
  });

  it("submit button renders the default label 'Save'", () => {
    render(<CphFormActions isDirty={false} />);
    expect(screen.getByRole("button", { name: "Save" })).toBeVisible();
  });

  it("renders a custom submitLabel instead of the default", () => {
    render(<CphFormActions isDirty={false} submitLabel="Save & continue" />);
    expect(screen.getByRole("button", { name: "Save & continue" })).toBeVisible();
  });

  it("submit button is type='submit' and calls nothing itself on click", async () => {
    const user = userEvent.setup();
    render(<CphFormActions isDirty={false} />);

    const submit = screen.getByRole("button", { name: "Save" });
    await user.click(submit);

    expect(submit.getAttribute("type")).toBe("submit");
  });

  it("disables the submit button and reads 'Saving…' when isSubmitting", () => {
    render(<CphFormActions isDirty={false} isSubmitting />);

    const submit = screen.getByRole("button", { name: "Saving…" });
    expect(submit).toBeDisabled();
  });

  it.each([false, true])(
    "renders Back only with onDiscard and calls it without confirmation when isDirty=%s",
    async (isDirty) => {
      const user = userEvent.setup();
      const onDiscard = vi.fn();
      const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);

      const { rerender } = render(<CphFormActions isDirty={isDirty} />);
      expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();

      rerender(<CphFormActions isDirty={isDirty} onDiscard={onDiscard} />);
      const back = screen.getByRole("button", { name: "Back" });
      expect(back).toBeVisible();
      expect(back).toHaveAttribute("type", "button");

      await user.click(back);
      expect(onDiscard).toHaveBeenCalledTimes(1);
      expect(confirm).not.toHaveBeenCalled();
    },
  );
});
