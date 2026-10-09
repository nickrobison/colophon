import type { Meta, StoryObj } from "@storybook/react";
import { useTable } from "@tanstack/react-table";

import { CphTableHead } from "../src/components/TableHead/CphTableHead";
import { cphColumnHelper } from "../src/table/column";
import { cphTableFeatures } from "../src/table/features";

const meta: Meta<typeof CphTableHead> = {
  title: "Components/Table/CphTableHead",
  component: CphTableHead,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof CphTableHead>;

type HeadRow = {
  id: string;
  name: string;
  amount: number;
};

const data: HeadRow[] = [
  { id: "alpha", name: "Alpha", amount: 42 },
  { id: "beta", name: "Beta", amount: 84 },
];

const helper = cphColumnHelper<HeadRow>();
const columns = helper.columns([
  helper.accessor("name", { header: "Name", enableSorting: true }),
  helper.accessor("amount", {
    header: "Amount",
    enableSorting: true,
    meta: { numeric: true },
  }),
]);

function HeadSurface() {
  const table = useTable({
    features: cphTableFeatures,
    columns,
    data,
    getRowId: (row) => row.id,
    enableMultiSort: false,
  });

  return (
    <table className="cph-table">
      <CphTableHead table={table} />
    </table>
  );
}

export const Default: Story = {
  render: () => <HeadSurface />,
};
