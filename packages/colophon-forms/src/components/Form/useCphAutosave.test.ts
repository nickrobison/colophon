import { useForm } from "@tanstack/react-form";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  CPH_AUTOSAVE_DEBOUNCE_MS,
  CPH_AUTOSAVE_RECEIPT_MS,
  useCphAutosave,
} from "./useCphAutosave";

interface Values {
  title: string;
}

function deferred() {
  let resolve!: () => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<void>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function setup(onSave: (values: Values) => void | Promise<void>) {
  return renderHook(
    ({ callback, enabled }) => {
      const form = useForm({ defaultValues: { title: "" } });
      const autosave = useCphAutosave({ form, onSave: callback, enabled });
      return { form, ...autosave };
    },
    { initialProps: { callback: onSave, enabled: true } },
  );
}

async function advance(ms = CPH_AUTOSAVE_DEBOUNCE_MS) {
  await act(() => vi.advanceTimersByTimeAsync(ms));
}

describe("useCphAutosave", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("serializes writes even when the newer save promise resolves first", async () => {
    const first = deferred();
    const second = deferred();
    let persisted = "";
    const onSave = vi.fn(({ title }: Values) =>
      (title === "first" ? first.promise : second.promise).then(() => {
        persisted = title;
      }),
    );
    const { result } = setup(onSave);
    act(() => result.current.form.setFieldValue("title", "first"));
    await advance();
    act(() => result.current.form.setFieldValue("title", "second"));
    await advance();

    expect(onSave).toHaveBeenCalledTimes(1);
    await act(async () => second.resolve());
    expect(result.current.state).toBe("saving");
    expect(persisted).toBe("");
    await act(async () => first.resolve());

    expect(onSave).toHaveBeenCalledTimes(2);
    expect(persisted).toBe("second");
    expect(result.current.state).toBe("saved");
    await advance(CPH_AUTOSAVE_RECEIPT_MS);
    expect(result.current.state).toBe("idle");
  });

  it("coalesces queued edits and waits for the latest write before reporting saved", async () => {
    const first = deferred();
    const last = deferred();
    const onSave = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(last.promise);
    const { result } = setup(onSave);
    act(() => result.current.form.setFieldValue("title", "first"));
    await advance();
    act(() => result.current.form.setFieldValue("title", "superseded"));
    await advance();
    act(() => result.current.form.setFieldValue("title", "latest"));
    await advance();
    await act(async () => first.resolve());

    expect(onSave).toHaveBeenCalledTimes(2);
    expect(onSave).toHaveBeenLastCalledWith({ title: "latest" });
    expect(result.current.state).toBe("saving");
    await act(async () => last.resolve());
    expect(result.current.state).toBe("saved");
  });

  it("does not bypass a newer edit's debounce when the active write settles", async () => {
    const first = deferred();
    const onSave = vi.fn().mockReturnValueOnce(first.promise).mockResolvedValue(undefined);
    const { result } = setup(onSave);
    act(() => result.current.form.setFieldValue("title", "first"));
    await advance();
    act(() => result.current.form.setFieldValue("title", "queued"));
    await advance();
    act(() => result.current.form.setFieldValue("title", "latest"));
    await act(async () => first.resolve());
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(result.current.state).not.toBe("saved");
    await advance();
    expect(onSave).toHaveBeenLastCalledWith({ title: "latest" });
    expect(result.current.state).toBe("saved");
  });

  it("uses the latest callback without restarting debounce or the receipt", async () => {
    const original = vi.fn();
    const latest = vi.fn();
    const { result, rerender } = setup(original);
    act(() => result.current.form.setFieldValue("title", "draft"));
    await advance(CPH_AUTOSAVE_DEBOUNCE_MS - 1);
    rerender({ callback: latest, enabled: true });
    await advance(1);
    expect(original).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledExactlyOnceWith({ title: "draft" });
    expect(result.current.state).toBe("saved");

    rerender({ callback: vi.fn(), enabled: true });
    await advance(CPH_AUTOSAVE_RECEIPT_MS);
    expect(result.current.state).toBe("idle");
    expect(latest).toHaveBeenCalledTimes(1);
  });

  it("uses the latest callback for a queued save", async () => {
    const first = deferred();
    const original = vi.fn().mockReturnValue(first.promise);
    const latest = vi.fn();
    const { result, rerender } = setup(original);
    act(() => result.current.form.setFieldValue("title", "first"));
    await advance();
    act(() => result.current.form.setFieldValue("title", "latest"));
    await advance();
    rerender({ callback: latest, enabled: true });
    await act(async () => first.resolve());
    expect(original).toHaveBeenCalledTimes(1);
    expect(latest).toHaveBeenCalledExactlyOnceWith({ title: "latest" });
  });

  it("continues with queued values after an older save fails", async () => {
    const first = deferred();
    const last = deferred();
    const onSave = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(last.promise);
    const { result } = setup(onSave);
    act(() => result.current.form.setFieldValue("title", "first"));
    await advance();
    act(() => result.current.form.setFieldValue("title", "latest"));
    await advance();
    await act(async () => first.reject(new Error("Old failure")));
    expect(onSave).toHaveBeenCalledTimes(2);
    expect(result.current.state).toBe("saving");
    await act(async () => last.reject(new Error("Latest failure")));
    expect(result.current.state).toBe("error");
    expect(result.current.errorMessage).toBe("Latest failure");
  });

  it("persists a return to default values after a write has started", async () => {
    const first = deferred();
    const onSave = vi.fn().mockReturnValueOnce(first.promise).mockResolvedValue(undefined);
    const { result } = setup(onSave);
    await advance();
    expect(onSave).not.toHaveBeenCalled();
    act(() => result.current.form.setFieldValue("title", "first"));
    await advance();
    act(() => result.current.form.setFieldValue("title", ""));
    await advance();
    await act(async () => first.resolve());
    expect(onSave).toHaveBeenLastCalledWith({ title: "" });
    expect(result.current.state).toBe("saved");
  });

  it.each(["disable", "unmount"])("drops queued writes on %s", async (action) => {
    const first = deferred();
    const onSave = vi.fn().mockReturnValue(first.promise);
    const { result, rerender, unmount } = setup(onSave);
    act(() => result.current.form.setFieldValue("title", "first"));
    await advance();
    act(() => result.current.form.setFieldValue("title", "queued"));
    await advance();
    if (action === "disable") {
      rerender({ callback: onSave, enabled: false });
    } else {
      unmount();
    }
    await act(async () => first.resolve());
    await advance();
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(result.current.state).not.toBe("saved");
  });

  it("clears the saved receipt as soon as newer values need saving", async () => {
    const onSave = vi.fn();
    const { result } = setup(onSave);
    act(() => result.current.form.setFieldValue("title", "first"));
    await advance();
    expect(result.current.state).toBe("saved");
    act(() => result.current.form.setFieldValue("title", "latest"));
    expect(result.current.state).toBe("idle");
    await advance();
    expect(onSave).toHaveBeenCalledTimes(2);
    expect(result.current.state).toBe("saved");
  });
});
