import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CphSimpleTable, type CphSimpleTableColumn } from "./CphSimpleTable";

type Row = { id: string; name: string; sources: number; owner: string };

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

/** First-cell values of every data row, in render order. */
function firstCellValues(): string[] {
  return screen
    .getAllByRole("row")
    .filter((row) => row.querySelector("td") !== null)
    .map((row) => row.querySelector("td")?.textContent?.trim() ?? "");
}

describe("CphSimpleTable", () => {
  it("renders rows and columns through the table role", () => {
    render(<CphSimpleTable aria-label="Inquiries" columns={columns} rows={rows} />);

    expect(screen.getByRole("table", { name: "Inquiries" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /Inquiry/ })).toBeInTheDocument();
    expect(firstCellValues()).toEqual(["Beta", "Alpha", "Gamma"]);
  });

  it("cycles sort ascending then descending on header click", async () => {
    const user = userEvent.setup();
    render(<CphSimpleTable aria-label="Inquiries" columns={columns} rows={rows} />);

    const nameHeader = screen.getByRole("columnheader", { name: /Inquiry/ });
    await user.click(within(nameHeader).getByRole("button", { name: /sort ascending/i }));
    expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
    expect(firstCellValues()).toEqual(["Alpha", "Beta", "Gamma"]);

    await user.click(within(nameHeader).getByRole("button", { name: /sort descending/i }));
    expect(nameHeader).toHaveAttribute("aria-sort", "descending");
    expect(firstCellValues()).toEqual(["Gamma", "Beta", "Alpha"]);
  });

  it("applies defaultSortDescriptor on initial render", () => {
    render(
      <CphSimpleTable
        aria-label="Inquiries"
        columns={columns}
        rows={rows}
        defaultSortDescriptor={{ column: "name", direction: "descending" }}
      />,
    );

    expect(screen.getByRole("columnheader", { name: /Inquiry/ })).toHaveAttribute(
      "aria-sort",
      "descending",
    );
    expect(firstCellValues()).toEqual(["Gamma", "Beta", "Alpha"]);
  });

  it("supports controlled sorting round-trips", async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    const sortDescriptor = { column: "name", direction: "ascending" as const };

    const { rerender } = render(
      <CphSimpleTable
        aria-label="Inquiries"
        columns={columns}
        rows={rows}
        sortDescriptor={sortDescriptor}
        onSortChange={onSortChange}
      />,
    );

    expect(firstCellValues()).toEqual(["Alpha", "Beta", "Gamma"]);
    await user.click(screen.getByRole("button", { name: /sort descending/i }));
    expect(onSortChange).toHaveBeenCalledWith({ column: "name", direction: "descending" });

    rerender(
      <CphSimpleTable
        aria-label="Inquiries"
        columns={columns}
        rows={rows}
        sortDescriptor={{ column: "name", direction: "descending" }}
        onSortChange={onSortChange}
      />,
    );

    expect(screen.getByRole("columnheader", { name: /Inquiry/ })).toHaveAttribute(
      "aria-sort",
      "descending",
    );
  });

  it("sorts by sortValue instead of the displayed accessor value", () => {
    const sortColumns: CphSimpleTableColumn<{ id: string; label: string; score: number }>[] = [
      {
        id: "label",
        header: "Label",
        accessor: (row) => row.label,
        sortValue: (row) => row.score,
      },
    ];
    const sortRows = [
      { id: "1", label: "Gamma", score: 10 },
      { id: "2", label: "Alpha", score: 30 },
      { id: "3", label: "Beta", score: 20 },
    ];

    render(
      <CphSimpleTable
        aria-label="Scores"
        columns={sortColumns}
        rows={sortRows}
        sortDescriptor={{ column: "label", direction: "ascending" }}
      />,
    );

    expect(screen.getByRole("columnheader", { name: /Label/ })).toHaveAttribute(
      "aria-sort",
      "ascending",
    );
    expect(screen.getAllByRole("cell").map((cell) => cell.textContent)).toEqual([
      "Gamma",
      "Beta",
      "Alpha",
    ]);
  });

  it("renders no sort affordance when allowsSorting is false", () => {
    render(
      <CphSimpleTable
        aria-label="Inquiries"
        columns={[{ id: "name", header: "Inquiry", allowsSorting: false }]}
        rows={rows}
      />,
    );

    expect(screen.queryByRole("button", { name: /sort/i })).not.toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /Inquiry/ })).toBeInTheDocument();
  });

  it("supports controlled selection and select-all", async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <CphSimpleTable
        aria-label="Inquiries"
        columns={columns}
        rows={rows}
        selectionMode="multiple"
        selectedKeys={new Set(["r1"])}
        onSelectionChange={onSelectionChange}
      />,
    );

    const betaRow = screen.getByRole("row", { name: /Beta/ });
    expect(betaRow).toHaveAttribute("data-selected", "true");

    const checkbox = within(betaRow).getByRole("checkbox", { name: /Select row r1/ });
    await user.click(checkbox);
    expect(onSelectionChange).toHaveBeenCalled();

    const selectAll = screen.getByRole("checkbox", { name: /Select all rows/ });
    await user.click(selectAll);
    expect(onSelectionChange).toHaveBeenCalledWith("all");
  });

  it("supports self-managed selection", async () => {
    const user = userEvent.setup();
    render(
      <CphSimpleTable
        aria-label="Inquiries"
        columns={columns}
        rows={rows}
        selectionMode="multiple"
        defaultSelectedKeys={new Set()}
      />,
    );

    const betaRow = screen.getByRole("row", { name: /Beta/ });
    const checkbox = within(betaRow).getByRole("checkbox", { name: /Select row r1/ });
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it("renders cursor pagination controls and fires callbacks", async () => {
    const user = userEvent.setup();
    const onNextPage = vi.fn();
    const onPreviousPage = vi.fn();
    render(
      <CphSimpleTable
        aria-label="Inquiries"
        columns={columns}
        rows={rows}
        pagination={{
          hasNextPage: true,
          hasPreviousPage: true,
          startCursor: "start",
          endCursor: "end",
          onNextPage,
          onPreviousPage,
        }}
      />,
    );

    expect(screen.getByRole("navigation", { name: "Table pagination" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(onNextPage).toHaveBeenCalledWith("end");
    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(onPreviousPage).toHaveBeenCalledWith("start");
  });

  it("renders the empty state when there are no rows", () => {
    render(<CphSimpleTable aria-label="Inquiries" columns={columns} rows={[]} />);

    expect(screen.getByText("No results")).toBeInTheDocument();
  });
});
