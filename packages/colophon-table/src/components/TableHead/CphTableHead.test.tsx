/** @packageDocumentation Tests for CphTableHead. */

import { useTable } from "@tanstack/react-table";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { cphColumnHelper } from "../../table/column";
import { cphTableFeatures } from "../../table/features";
import { CphTableHead } from "./CphTableHead";

type TestRow = {
  id: string;
  name: string;
};

const helper = cphColumnHelper<TestRow>();
const columns = helper.columns([
  helper.accessor("name", {
    header: () => <span>Function header</span>,
  }),
]);

function TableHeadSurface() {
  const table = useTable({
    features: cphTableFeatures,
    columns,
    data: [{ id: "row-1", name: "Name" }],
    getRowId: (row) => row.id,
    enableMultiSort: false,
  });

  return (
    <table>
      <CphTableHead table={table} />
    </table>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CphTableHead", () => {
  it("renders function headers without React warnings", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<TableHeadSurface />);

    expect(screen.getByRole("columnheader")).toHaveTextContent("Function header");
    expect(consoleError).not.toHaveBeenCalled();
  });
});
