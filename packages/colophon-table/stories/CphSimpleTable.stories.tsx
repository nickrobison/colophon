import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import type { Selection } from "react-aria-components";

import {
  CphSimpleTable,
  type CphSimpleTableColumn,
  type CphSimpleTableProps,
} from "../src/components/SimpleTable/CphSimpleTable";

type Row = { id: string; name: string; sources: number; owner: string };
type SimpleTableProps = CphSimpleTableProps<Row>;

const columns: CphSimpleTableColumn<Row>[] = [
  { id: "name", header: "Inquiry", accessor: (row) => row.name, allowsSorting: true },
  { id: "owner", header: "Owner", accessor: (row) => row.owner, allowsSorting: true },
  {
    id: "sources",
    header: "Sources",
    accessor: (row) => row.sources,
    allowsSorting: true,
    align: "right",
  },
];

const rows: Row[] = [
  { id: "r1", name: "Beta", owner: "Ada", sources: 10 },
  { id: "r2", name: "Alpha", owner: "Grace", sources: 2 },
  { id: "r3", name: "Gamma", owner: "Lin", sources: 30 },
];

function SimpleTable(args: SimpleTableProps) {
  return <CphSimpleTable {...args} />;
}

function SelectionSurface(args: SimpleTableProps) {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set<string>());
  return (
    <SimpleTable
      {...args}
      selectionMode="multiple"
      selectedKeys={selectedKeys}
      onSelectionChange={setSelectedKeys}
    />
  );
}

const meta: Meta<typeof SimpleTable> = {
  title: "Components/Table/CphSimpleTable",
  component: SimpleTable,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof SimpleTable>;

export const Default: Story = {
  args: {
    "aria-label": "Inquiries",
    columns,
    rows,
  },
};

export const Sortable: Story = {
  args: {
    "aria-label": "Inquiries",
    columns,
    rows,
    defaultSortDescriptor: { column: "name", direction: "ascending" },
  },
};

const baseArgs = {
  "aria-label": "Inquiries",
  columns,
  rows,
};

export const MultipleSelection: Story = {
  render: (args) => <SelectionSurface {...args} />,
  args: baseArgs,
};

export const SelectAll: Story = {
  render: (args) => (
    <SimpleTable
      {...args}
      selectionMode="multiple"
      defaultSelectedKeys={new Set<string>(rows.map((row) => row.id))}
    />
  ),
  args: baseArgs,
};

export const CursorPagination: Story = {
  args: {
    "aria-label": "Inquiries",
    columns,
    rows,
    pagination: {
      hasNextPage: true,
      hasPreviousPage: true,
      startCursor: "eyJvZmZzZXQiOjEsIn0=",
      endCursor: "eyJvZmZzZXQiOjIuOX0=",
      onNextPage: () => {},
      onPreviousPage: () => {},
    },
  },
};

export const Empty: Story = {
  args: {
    "aria-label": "Inquiries",
    columns,
    rows: [],
  },
};

export const KitchenSink: Story = {
  render: (args) => (
    <SimpleTable
      {...args}
      selectionMode="multiple"
      defaultSortDescriptor={{ column: "name", direction: "ascending" }}
      defaultSelectedKeys={new Set<string>(rows.map((row) => row.id))}
      pagination={{
        hasNextPage: false,
        hasPreviousPage: false,
        onNextPage: () => {},
        onPreviousPage: () => {},
      }}
    />
  ),
  args: baseArgs,
};
