import type { Meta, StoryObj } from "@storybook/react";
import { useState, type ReactElement } from "react";

import { CphSkeleton } from "../src/components/CphSkeleton";
import { CphTableEmpty } from "../src/components/CphTableEmpty";
import { CphPagination } from "../src/components/Pagination/CphPagination";
import { CphSortFilterSheet } from "../src/components/SortFilterSheet/CphSortFilterSheet";
import {
  CphTableSummary,
  type CphTableSummaryTable,
} from "../src/components/Summary/CphTableSummary";
import { CphToolbar } from "../src/components/Toolbar/CphToolbar";

const filterOptions = [
  { value: "all", label: "All" },
  { value: "source", label: "Source" },
];

const summaryTable: CphTableSummaryTable = {
  getLeafColumns: () => [
    {
      id: "name",
      getIsVisible: () => true,
      getIsPinned: () => "start",
      getMeta: () => ({}),
      getAggregationValue: () => undefined,
    },
    {
      id: "amount",
      getIsVisible: () => true,
      getIsPinned: () => false,
      getMeta: () => ({ aggregate: "sum", numeric: true }),
      getAggregationValue: () => 147,
    },
  ],
  getFilteredRowModel: () => ({ rows: [{}, {}, {}] }),
};

function TableSummarySurface() {
  return (
    <table className="cph-table">
      <CphTableSummary table={summaryTable} showSummary totalCount={3} />
    </table>
  );
}

function SkeletonSurface() {
  return (
    <table className="cph-table">
      <tbody>
        <CphSkeleton rowCount={3} visibleColumnCount={3} density="compact" />
      </tbody>
    </table>
  );
}

function EmptySurface() {
  return (
    <table className="cph-table">
      <CphTableEmpty message="No records found" visibleColumnCount={3} />
    </table>
  );
}

function ToolbarSurface() {
  const [searchValue, setSearchValue] = useState("alpha");
  const [filterValue, setFilterValue] = useState("all");

  return (
    <CphToolbar
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      searchPlaceholder="Search sources"
      filters={[
        {
          key: "category",
          label: "Category",
          options: filterOptions,
          value: filterValue,
          onChange: setFilterValue,
        },
      ]}
    />
  );
}

function PaginationSurface() {
  const [currentPage, setCurrentPage] = useState(2);
  const [pageSize, setPageSize] = useState<8 | 12 | 20>(8);

  return (
    <CphPagination
      currentPage={currentPage}
      totalPages={5}
      pageSize={pageSize}
      onPageChange={setCurrentPage}
      onPageSizeChange={setPageSize}
    />
  );
}

const surfaceFactories = {
  toolbar: ToolbarSurface,
  sortFilterSheet: () => (
    <CphSortFilterSheet
      defaultOpen
      title="Sort and filter"
      description="Choose how to view the table."
    >
      <p>Filter controls</p>
    </CphSortFilterSheet>
  ),
  pagination: PaginationSurface,
  summary: TableSummarySurface,
  skeleton: SkeletonSurface,
  empty: EmptySurface,
} satisfies Record<string, () => ReactElement>;

type SurfaceName = keyof typeof surfaceFactories;

function E2ESurface({ surface }: { surface: SurfaceName }) {
  const Surface = surfaceFactories[surface];
  return <Surface />;
}

const meta: Meta<typeof E2ESurface> = {
  title: "Components/CphToolbarE2e",
  component: E2ESurface,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof E2ESurface>;

export const Toolbar: Story = { args: { surface: "toolbar" } };

export const SortFilterSheet: Story = { args: { surface: "sortFilterSheet" } };

export const Pagination: Story = { args: { surface: "pagination" } };

export const Summary: Story = { args: { surface: "summary" } };

export const Skeleton: Story = { args: { surface: "skeleton" } };

export const Empty: Story = { args: { surface: "empty" } };
