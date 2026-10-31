/** @packageDocumentation Storybook stories for the multi-select filter primitive. */

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import {
  CphTableFilterMultiSelect,
  type CphTableFilterOption,
} from "../src/components/FilterMultiSelect/CphTableFilterMultiSelect";

const meta: Meta<typeof CphTableFilterMultiSelect> = {
  title: "Components/Table/CphTableFilterMultiSelect",
  component: CphTableFilterMultiSelect,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof CphTableFilterMultiSelect>;

const STATUS_OPTIONS: CphTableFilterOption[] = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "complete", label: "Complete" },
  { value: "failed", label: "Failed" },
];

function InteractiveMultiSelect(props: Parameters<typeof CphTableFilterMultiSelect>[0]) {
  const [value, setValue] = useState<string[]>(props.value);
  return (
    <CphTableFilterMultiSelect
      {...props}
      value={value}
      onValueChange={(next) => {
        setValue(next);
        props.onValueChange?.(next);
      }}
    />
  );
}

export const Default: Story = {
  render: (args) => <InteractiveMultiSelect {...args} />,
  args: {
    value: [],
    options: STATUS_OPTIONS,
    label: "Status",
  },
};

export const WithSelection: Story = {
  render: (args) => <InteractiveMultiSelect {...args} />,
  args: {
    value: ["active", "failed"],
    options: STATUS_OPTIONS,
    label: "Status",
  },
};

export const WithPlaceholder: Story = {
  render: (args) => <InteractiveMultiSelect {...args} />,
  args: {
    value: [],
    options: STATUS_OPTIONS,
    label: "Status",
    placeholder: "Any status",
  },
};

export const Clearable: Story = {
  render: (args) => <InteractiveMultiSelect {...args} />,
  args: {
    value: ["pending", "complete"],
    options: STATUS_OPTIONS,
    label: "Status",
    clearable: true,
  },
};

export const NoOptions: Story = {
  render: (args) => <InteractiveMultiSelect {...args} />,
  args: {
    value: [],
    options: [],
    label: "Status",
  },
};
