import type { Meta, StoryObj } from "@storybook/react";
import { useTable } from "@tanstack/react-table";
import { Fragment } from "react";

import {
  CphDataTable,
  CphRowDetail,
  CphTableHead,
  CphTableRow,
  Cell,
  cphColumnHelper,
} from "../src/index";
import { cphTableFeatures } from "../src/table/features";

type DemoRow = {
  id: string;
  name: string;
  category: string;
  amount: number;
  detail: string;
};

const data: DemoRow[] = [
  { id: "alpha", name: "Alpha", category: "Source", amount: 42, detail: "Alpha detail" },
  { id: "beta", name: "Beta", category: "Collection", amount: 84, detail: "Beta detail" },
  { id: "gamma", name: "Gamma", category: "Source", amount: 21, detail: "Gamma detail" },
];

const helper = cphColumnHelper<DemoRow>();
const columns = helper.columns([
  helper.accessor("name", {
    header: "Name",
    enableSorting: true,
    enablePinning: true,
    meta: { widthClass: "source" },
  }),
  helper.accessor("category", { header: "Category", enableSorting: true }),
  helper.accessor("amount", {
    header: "Amount",
    enableSorting: true,
    meta: { numeric: true, aggregate: "sum" },
  }),
]);

function DataTableSurface() {
  const table = useTable({
    features: cphTableFeatures,
    columns,
    data,
    getRowId: (row) => row.id,
    enableMultiSort: false,
    enableColumnPinning: true,
    enableRowSelection: true,
    getRowCanExpand: () => true,
  });

  return (
    <CphDataTable table={table} data-testid="data-table-surface">
      <CphTableHead table={table} />
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <Fragment key={row.id}>
            <CphTableRow
              className="cph-table__row"
              data-selected={row.getIsSelected() ? "true" : undefined}
              data-expanded={row.getIsExpanded() ? "true" : undefined}
            >
              {row.getVisibleCells().map((cell, index) => (
                <Cell
                  key={cell.id}
                  pinned={cell.column.getIsPinned() || undefined}
                  numeric={cell.column.id === "amount"}
                  className={index === 0 ? "cph-table__source-cell" : undefined}
                >
                  {index === 0 ? (
                    <>
                      <button
                        type="button"
                        className="cph-table__disclosure"
                        aria-label={`Expand ${row.original.name}`}
                        aria-expanded={row.getIsExpanded()}
                        onClick={() => row.toggleExpanded()}
                      >
                        {row.getIsExpanded() ? "−" : "+"}
                      </button>
                      <input
                        type="checkbox"
                        className="cph-table__checkbox"
                        aria-label={`Select ${row.original.name}`}
                        checked={row.getIsSelected()}
                        onChange={() => row.toggleSelected()}
                      />
                      {String(cell.getValue())}
                    </>
                  ) : (
                    String(cell.getValue())
                  )}
                </Cell>
              ))}
            </CphTableRow>
            {row.getIsExpanded() && (
              <CphRowDetail visibleCellsCount={columns.length} expanded>
                {row.original.detail}
              </CphRowDetail>
            )}
          </Fragment>
        ))}
      </tbody>
    </CphDataTable>
  );
}

const meta: Meta<typeof DataTableSurface> = {
  title: "Components/CphDataTableE2e",
  component: DataTableSurface,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DataTableSurface>;

export const Default: Story = { args: {} };
