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

  it.each([false, true])(
    "does not prompt when explicitly disabled and isDirty=%s",
    async (isDirty) => {
      const user = userEvent.setup();
      const onDiscard = vi.fn();
      const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
      render(<CphFormActions isDirty={isDirty} onDiscard={onDiscard} confirmDiscard={false} />);

      await user.click(screen.getByRole("button", { name: "Back" }));

      expect(confirm).not.toHaveBeenCalled();
      expect(onDiscard).toHaveBeenCalledTimes(1);
    },
  );

  it.each([true, "Leave without saving?", ""])(
    "skips enabled confirmation for clean forms with confirmDiscard=%s",
    async (confirmDiscard) => {
      const user = userEvent.setup();
      const onDiscard = vi.fn();
      const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
      render(
        <CphFormActions isDirty={false} onDiscard={onDiscard} confirmDiscard={confirmDiscard} />,
      );

      await user.click(screen.getByRole("button", { name: "Back" }));

      expect(confirm).not.toHaveBeenCalled();
      expect(onDiscard).toHaveBeenCalledTimes(1);
    },
  );

  describe.each([
    { confirmDiscard: true, message: "Discard unsaved changes?" },
    { confirmDiscard: "Leave without saving?", message: "Leave without saving?" },
    { confirmDiscard: "", message: "" },
  ])("dirty confirmation with confirmDiscard=$confirmDiscard", ({ confirmDiscard, message }) => {
    it.each([false, true])("discards only when confirmation returns %s", async (accepted) => {
      const user = userEvent.setup();
      const confirm = vi.spyOn(window, "confirm").mockReturnValue(accepted);
      const onDiscard = vi.fn(() => {
        expect(confirm).toHaveBeenCalledExactlyOnceWith(message);
      });
      render(<CphFormActions isDirty onDiscard={onDiscard} confirmDiscard={confirmDiscard} />);

      await user.click(screen.getByRole("button", { name: "Back" }));

      expect(confirm).toHaveBeenCalledExactlyOnceWith(message);
      expect(onDiscard).toHaveBeenCalledTimes(accepted ? 1 : 0);
    });
  });

  it.each([false, true])(
    "confirms keyboard activation and respects acceptance=%s",
    async (accepted) => {
      const user = userEvent.setup();
      const onDiscard = vi.fn();
      const confirm = vi.spyOn(window, "confirm").mockReturnValue(accepted);
      render(<CphFormActions isDirty onDiscard={onDiscard} confirmDiscard />);

      await user.tab();
      expect(screen.getByRole("button", { name: "Back" })).toHaveFocus();
      await user.keyboard("{Enter}");

      expect(confirm).toHaveBeenCalledExactlyOnceWith("Discard unsaved changes?");
      expect(onDiscard).toHaveBeenCalledTimes(accepted ? 1 : 0);
    },
  );

  it("uses current dirty state and asks again after cancellation", async () => {
    const user = userEvent.setup();
    const onDiscard = vi.fn();
    const confirm = vi
      .spyOn(window, "confirm")
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);
    const { rerender } = render(<CphFormActions isDirty onDiscard={onDiscard} confirmDiscard />);

    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(onDiscard).not.toHaveBeenCalled();
    expect(screen.getByText("Unsaved changes")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(confirm).toHaveBeenCalledTimes(2);
    expect(onDiscard).toHaveBeenCalledTimes(1);

    rerender(<CphFormActions isDirty={false} onDiscard={onDiscard} confirmDiscard />);
    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(confirm).toHaveBeenCalledTimes(2);
    expect(onDiscard).toHaveBeenCalledTimes(2);
  });

  it("does not render Back or confirm without a discard handler", () => {
    const confirm = vi.spyOn(window, "confirm");
    render(<CphFormActions isDirty confirmDiscard />);

    expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();
    expect(confirm).not.toHaveBeenCalled();
  });
});
