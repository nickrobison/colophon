/** @packageDocumentation Colophon Table package entry point. */

export {
  CphProvider,
  useCphDensity,
  useCphTheme,
} from "@nickrobison/colophon";

export { type CphTableFeatures, cphTableFeatures } from "./table/features";
export { useCphTable, type CphTableOptions } from "./table/useCphTable";
export { type CphColumnMeta, cphColumnHelper } from "./table/column";
export { getAggregationValue } from "./table/summary";
export { PAGE_SIZES, DEFAULT_PAGE_SIZE, nextPageSize, type PageSize } from "./table/pageSize";

export { composeClassName } from "./utils/composeClassName";
export { CphTableDensityProvider, useCphTableDensity } from "./theme/CphTableDensity";

// Table components
export { CphDataTable } from "./components/DataTable/CphDataTable";
export { CphTableHead } from "./components/TableHead/CphTableHead";
export { HeaderCell, type SortDirection } from "./components/TableHead/HeaderCell";
export { CphTableRow } from "./components/TableRow/CphTableRow";
export { Cell } from "./components/TableRow/Cell";
export { CphRowDetail } from "./components/RowDetail/CphRowDetail";
export { CphSkeleton } from "./components/CphSkeleton";
export { CphTableEmpty } from "./components/CphTableEmpty";
export { CphTableSummary } from "./components/Summary/CphTableSummary";
export { CphPagination } from "./components/Pagination/CphPagination";
export { CphToolbar } from "./components/Toolbar/CphToolbar";
export { CphSortFilterSheet } from "./components/SortFilterSheet/CphSortFilterSheet";
export { CphStatusChip } from "./components/StatusChip/CphStatusChip";
