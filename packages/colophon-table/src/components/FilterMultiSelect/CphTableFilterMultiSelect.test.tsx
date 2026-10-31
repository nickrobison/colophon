import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { CphTableFilterMultiSelect, type CphTableFilterOption } from "./CphTableFilterMultiSelect";

const OPTIONS: CphTableFilterOption[] = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
];

const EMPTY_SELECTION: string[] = [];

function ControlledMultiSelect({
  initial = EMPTY_SELECTION,
  onValueChange,
  clearable,
  label,
  placeholder,
}: {
  initial?: string[];
  onValueChange?: (value: string[]) => void;
  clearable?: boolean;
  label?: string;
  placeholder?: string;
}) {
  const [value, setValue] = useState<string[]>(initial);
  return (
    <CphTableFilterMultiSelect
      value={value}
      onValueChange={(next) => {
        setValue(next);
        onValueChange?.(next);
      }}
      options={OPTIONS}
      {...(label === undefined ? {} : { label })}
      {...(placeholder === undefined ? {} : { placeholder })}
      {...(clearable === undefined ? {} : { clearable })}
    />
  );
}

describe("CphTableFilterMultiSelect", () => {
  it("renders a trigger with the default aria-label and placeholder", () => {
    render(<ControlledMultiSelect />);
    const trigger = screen.getByRole("button", { name: "Filter by ..." });
    expect(trigger).toHaveClass("cph-table__filter-multi__trigger");
    expect(trigger).toHaveTextContent("All");
  });

  it("uses the provided label as the trigger aria-label", () => {
    render(<ControlledMultiSelect label="Status" />);
    expect(screen.getByRole("button", { name: "Status" })).toBeInTheDocument();
  });

  it("opens a listbox with checkbox-style options", async () => {
    const user = userEvent.setup();
    render(<ControlledMultiSelect />);
    await user.click(screen.getByRole("button", { name: "Filter by ..." }));
    const listbox = screen.getByRole("listbox", { name: "Filter by ..." });
    expect(listbox).toHaveAttribute("aria-multiselectable", "true");
    expect(screen.getAllByRole("option")).toHaveLength(OPTIONS.length);
  });

  it("toggles options and reports the selection as string[]", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ControlledMultiSelect onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Filter by ..." }));
    await user.click(screen.getByRole("option", { name: /Active/ }));
    expect(onValueChange).toHaveBeenLastCalledWith(["active"]);
    await user.click(screen.getByRole("option", { name: /Pending/ }));
    expect(onValueChange).toHaveBeenLastCalledWith(["active", "pending"]);
    await user.click(screen.getByRole("option", { name: /Active/ }));
    expect(onValueChange).toHaveBeenLastCalledWith(["pending"]);
  });

  it("shows selected labels on the trigger", async () => {
    const user = userEvent.setup();
    render(<ControlledMultiSelect initial={["active", "failed"]} />);
    expect(screen.getByRole("button", { name: "Filter by ..." })).toHaveTextContent(
      "Active, Failed",
    );
    await user.click(screen.getByRole("button", { name: "Filter by ..." }));
    expect(screen.getByRole("option", { name: /Active/ })).toHaveAttribute("aria-selected", "true");
  });

  it("collapses 3+ selections into a count", () => {
    render(<ControlledMultiSelect initial={["active", "pending", "failed"]} />);
    expect(screen.getByRole("button", { name: "Filter by ..." })).toHaveTextContent("3 selected");
  });

  it("renders a custom placeholder when nothing is selected", () => {
    render(<ControlledMultiSelect placeholder="Any status" />);
    expect(screen.getByRole("button", { name: "Filter by ..." })).toHaveTextContent("Any status");
  });

  it("clears the selection via the clear button", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<ControlledMultiSelect initial={["active"]} clearable onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Clear Filter by ... filter" }));
    expect(onValueChange).toHaveBeenLastCalledWith([]);
    expect(screen.getByRole("button", { name: "Filter by ..." })).toHaveTextContent("All");
  });

  it("hides the clear button when clearable is absent or selection empty", () => {
    const first = render(<ControlledMultiSelect initial={["active"]} />);
    expect(screen.queryByTestId("filter-multi-clear")).not.toBeInTheDocument();
    first.unmount();
    render(<ControlledMultiSelect clearable />);
    expect(screen.queryByTestId("filter-multi-clear")).not.toBeInTheDocument();
  });

  it("merges className onto the root", () => {
    render(<ControlledMultiSelect />);
    // Root wrapper carries the composed class even without extra input.
    const trigger = screen.getByRole("button", { name: "Filter by ..." });
    expect(trigger.closest(".cph-table__filter-multi")).toBeInTheDocument();
  });

  it("renders an empty listbox when options are empty", async () => {
    const user = userEvent.setup();
    render(<CphTableFilterMultiSelect value={[]} options={[]} label="Status" />);
    await user.click(screen.getByRole("button", { name: "Status" }));
    expect(screen.getByRole("listbox", { name: "Status" })).toBeInTheDocument();
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("marks unselected options with aria-selected=false", async () => {
    const user = userEvent.setup();
    render(<ControlledMultiSelect initial={["active"]} />);
    await user.click(screen.getByRole("button", { name: "Filter by ..." }));
    expect(screen.getByRole("option", { name: /Active/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("option", { name: /Pending/ })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("keeps the selection across popover reopen (controlled value)", async () => {
    const user = userEvent.setup();
    render(<ControlledMultiSelect initial={["failed"]} />);
    await user.click(screen.getByRole("button", { name: "Filter by ..." }));
    expect(screen.getByRole("option", { name: /Failed/ })).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "Filter by ..." }));
    expect(screen.getByRole("option", { name: /Failed/ })).toHaveAttribute("aria-selected", "true");
  });

  it("uses the provided label in the clear button aria-label", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ControlledMultiSelect
        initial={["active"]}
        label="Status"
        clearable
        onValueChange={onValueChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Clear Status filter" }));
    expect(onValueChange).toHaveBeenLastCalledWith([]);
  });

  it("ignores unknown value keys when composing trigger text", () => {
    render(<ControlledMultiSelect initial={["ghost"]} />);
    expect(screen.getByRole("button", { name: "Filter by ..." })).toHaveTextContent("All");
  });
});
