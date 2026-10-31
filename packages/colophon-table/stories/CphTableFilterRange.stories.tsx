/** @packageDocumentation Storybook stories for the numeric range filter primitive. */

import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import {
  CphTableFilterRange,
  type CphTableFilterRangeValue,
} from "../src/components/FilterRange/CphTableFilterRange";

const meta: Meta<typeof CphTableFilterRange> = {
  title: "Components/Table/CphTableFilterRange",
  component: CphTableFilterRange,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof CphTableFilterRange>;

function InteractiveRange(props: Parameters<typeof CphTableFilterRange>[0]) {
  const [value, setValue] = useState<CphTableFilterRangeValue>(props.value ?? {});
  return (
    <CphTableFilterRange
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
  render: (args) => <InteractiveRange {...args} />,
  args: {
    label: "Value",
  },
};

export const WithBounds: Story = {
  render: (args) => <InteractiveRange {...args} />,
  args: {
    label: "Value",
    min: 0,
    max: 100,
  },
};

export const WithStep: Story = {
  render: (args) => <InteractiveRange {...args} />,
  args: {
    label: "Value",
    min: 0,
    max: 100,
    step: 5,
  },
};

export const PartialValue: Story = {
  render: (args) => <InteractiveRange {...args} />,
  args: {
    label: "Value",
    value: { min: 10 },
  },
};

export const WithPlaceholder: Story = {
  render: (args) => <InteractiveRange {...args} />,
  args: {
    label: "Value",
    placeholder: { min: "from", max: "to" },
  },
};
