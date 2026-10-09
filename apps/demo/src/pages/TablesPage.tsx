/** @packageDocumentation Demo table page. */

import { CphAppShell } from "@nickrobison/colophon";
import {
  Cell,
  CphDataTable,
  CphPagination,
  CphTableHead,
  CphTableRow,
  CphToolbar,
  cphColumnHelper,
  cphTableFeatures,
  useCphTableState,
  type PageSize,
} from "@nickrobison/colophon-table";
import { useTable } from "@tanstack/react-table";
import { useMemo, useState } from "react";

import { rows as sourceRows } from "../data";

type LedgerRow = (typeof sourceRows)[number];

const helper = cphColumnHelper<LedgerRow>();
const columns = helper.columns([
  helper.accessor("id", { header: "ID", meta: { widthClass: "source" } }),
  helper.accessor("inquiry", { header: "Inquiry", enableSorting: true }),
  helper.accessor("owner", { header: "Owner", enableSorting: true }),
  helper.accessor("sources", {
    header: "Sources",
    enableSorting: true,
    meta: { numeric: true, aggregate: "sum" },
  }),
  helper.accessor("stageLabel", { header: "Stage" }),
]);

export function TablesPage() {
  const [search, setSearch] = useState("");
  const data = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sourceRows;
    return sourceRows.filter((row) => row.inquiry.toLowerCase().includes(query));
  }, [search]);

  const tableState = useCphTableState({});
  const table = useTable(
    {
      features: cphTableFeatures,
      columns,
      data,
      getRowId: (row) => row.id,
      enableMultiSort: false,
      ...tableState,
    },
    (state) => ({ pagination: state.pagination }),
  );

  const pagination = table.state.pagination;
  // Sound: the hook defaults pageSize to 8 and only PageSize values are ever
  // written through CphPagination.
  const pageSize = pagination.pageSize as PageSize;

  return (
    <CphAppShell>
      <h1>Table Demo</h1>
      <p>Full register of table components.</p>
      <CphToolbar searchValue={search} onSearchChange={setSearch} />
      <CphDataTable table={table} tableLabel="Ledger register" showSummary>
        <CphTableHead table={table} />
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <CphTableRow
              key={row.id}
              className="cph-table__row"
              data-selected={row.getIsSelected() ? "true" : undefined}
            >
              {row.getVisibleCells().map((cell) => (
                <Cell
                  key={cell.id}
                  columnId={cell.column.id}
                  numeric={cell.column.id === "sources" ? true : undefined}
                >
                  {String(cell.getValue() ?? "")}
                </Cell>
              ))}
            </CphTableRow>
          ))}
        </tbody>
      </CphDataTable>
      <CphPagination
        currentPage={pagination.pageIndex + 1}
        totalPages={table.getPageCount()}
        onPageChange={(page) => table.setPageIndex(page - 1)}
        pageSize={pageSize}
        onPageSizeChange={(size: PageSize) => table.setPageSize(size)}
      />
    </CphAppShell>
  );
}
