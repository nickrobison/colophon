/** @packageDocumentation Table toolbar with search and filter controls. */

import { Search, Filter, ChevronDown, X } from "lucide-react";
import type { HTMLAttributes, ReactNode, Key } from "react";
import {
  Button,
  Input,
  SearchField,
  Select,
  SelectValue,
  ListBox,
  ListBoxItem,
} from "react-aria-components";

import { composeClassName } from "../../utils/composeClassName";

export interface CphToolbarProps extends HTMLAttributes<HTMLDivElement> {
  /** Search input value. */
  searchValue?: string;
  /** Callback when search value changes. */
  onSearchChange?: (value: string) => void;
  /** Callback when search is submitted. */
  onSearchSubmit?: (value: string) => void;
  /** Filter options for the filter selects. */
  filters?: Array<{
    key: string;
    label: string;
    options: Array<{ value: string; label: string }>;
    value?: string;
    onChange?: (value: string) => void;
  }>;
  /** Additional actions to render in the toolbar. */
  actions?: ReactNode;
  /** Placeholder for search input. */
  searchPlaceholder?: string;
}

type CphToolbarFilter = NonNullable<CphToolbarProps["filters"]>[number];

const EMPTY_FILTERS: NonNullable<CphToolbarProps["filters"]> = [];

function createFilterChangeHandler(
  filterOnChange: CphToolbarFilter["onChange"],
): (value: Key | null) => void {
  return (value) => {
    if (typeof value === "string" && filterOnChange) {
      filterOnChange(value);
    }
  };
}

export function CphToolbar({
  searchValue = "",
  onSearchChange,
  onSearchSubmit,
  filters = EMPTY_FILTERS,
  actions,
  searchPlaceholder = "Search…",
  className,
  children,
  ...props
}: CphToolbarProps) {
  const handleSearchChange = (value: string) => {
    onSearchChange?.(value);
  };

  // For native elements, composeClassName may return a function (render-props callback).
  // We need to resolve it to a string for native DOM elements.
  const rootClassName = (() => {
    const composed = composeClassName("cph-table__toolbar", className);
    return typeof composed === "function" ? composed({ defaultClassName: undefined }) : composed;
  })();

  return (
    <div {...props} className={rootClassName} data-cph-table="toolbar" data-testid="toolbar">
      <SearchField
        aria-label="Search table"
        value={searchValue}
        onChange={handleSearchChange}
        {...(onSearchSubmit ? { onSubmit: onSearchSubmit } : {})}
        className={composeClassName("cph-table__search", undefined)}
      >
        <Search size={16} aria-hidden="true" />
        <Input placeholder={searchPlaceholder} className="cph-table__search-input" />
        {searchValue && (
          <Button
            className="cph-table__search-clear"
            onPress={() => handleSearchChange("")}
            aria-label="Clear search"
          >
            <X size={14} />
          </Button>
        )}
      </SearchField>

      {filters.length > 0 && (
        <div className="cph-table__filter" role="group" aria-label="Table filters">
          {filters.map((filter) => (
            <Select
              key={filter.key}
              {...(filter.value !== undefined ? { selectedKey: filter.value } : {})}
              aria-label={filter.label}
              {...(filter.onChange
                ? { onSelectionChange: createFilterChangeHandler(filter.onChange) }
                : {})}
              className={composeClassName("cph-table__filter-select", undefined)}
            >
              <Button className="cph-table__filter-btn">
                <Filter size={14} aria-hidden="true" />
                <SelectValue>
                  {({ selectedText, defaultChildren }) =>
                    selectedText || defaultChildren || filter.label
                  }
                </SelectValue>
                <ChevronDown size={14} aria-hidden="true" />
              </Button>
              <ListBox>
                {filter.options.map((option) => (
                  <ListBoxItem key={option.value} id={option.value} textValue={option.label}>
                    {option.label}
                  </ListBoxItem>
                ))}
              </ListBox>
            </Select>
          ))}
        </div>
      )}

      {actions && (
        <div className="cph-table__actions" data-cph-table="toolbar-actions">
          {actions}
        </div>
      )}

      {children}
    </div>
  );
}
