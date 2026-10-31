import { Check, ChevronDown, X } from "lucide-react";
import type { ReactElement } from "react";
import {
  Button,
  DialogTrigger,
  ListBox,
  ListBoxItem,
  Popover,
  type Selection,
} from "react-aria-components";

export interface CphTableFilterOption {
  value: string;
  label: string;
}

export interface CphTableFilterMultiSelectProps {
  /** Currently selected values (controlled). */
  value: string[];
  /** Called when the selection changes. */
  onValueChange?: ((value: string[]) => void) | undefined;
  /** Options rendered in the popover listbox. */
  options: CphTableFilterOption[];
  /** Visible label; also used to derive `aria-label` when the trigger needs one. */
  label?: string | undefined;
  /** Trigger text when nothing is selected. */
  placeholder?: string | undefined;
  /** Render a clear button that resets the selection to `[]`. */
  clearable?: boolean | undefined;
  className?: string | undefined;
}

function selectionToStrings(selection: Selection, options: CphTableFilterOption[]): string[] {
  if (selection === "all") {
    return options.map((option) => option.value);
  }
  return [...selection].map(String);
}

/**
 * Multi-select filter control: a trigger button opening a popover listbox with
 * checkbox-style items (`selectionMode="multiple"`).
 *
 * Selection state lives entirely in the controlled `value` prop; the listbox
 * reports changes through `onValueChange` as a plain `string[]`.
 */
export function CphTableFilterMultiSelect({
  value,
  onValueChange,
  options,
  label,
  placeholder = "All",
  clearable,
  className = "",
}: CphTableFilterMultiSelectProps): ReactElement {
  const ariaLabel = label ?? "Filter by ...";
  const selectedLabels = options
    .filter((option) => value.includes(option.value))
    .map((option) => option.label);

  const triggerText =
    selectedLabels.length === 0
      ? placeholder
      : selectedLabels.length <= 2
        ? selectedLabels.join(", ")
        : `${selectedLabels.length} selected`;

  const handleSelectionChange = (selection: Selection) => {
    onValueChange?.(selectionToStrings(selection, options));
  };

  const handleClear = () => {
    onValueChange?.([]);
  };

  return (
    <div className={`cph-table__filter-multi ${className}`}>
      <DialogTrigger>
        <Button
          className="cph-table__filter-multi__trigger"
          aria-label={ariaLabel}
          data-testid="filter-multi-trigger"
        >
          <span className="cph-table__filter-multi__trigger-text">{triggerText}</span>
          <ChevronDown size={14} aria-hidden="true" />
        </Button>
        <Popover className="cph-table__filter-multi__popover">
          <ListBox
            aria-label={ariaLabel}
            selectionMode="multiple"
            selectedKeys={value}
            onSelectionChange={handleSelectionChange}
            className="cph-table__filter-multi__list"
          >
            {options.map((option) => (
              <ListBoxItem
                key={option.value}
                id={option.value}
                textValue={option.label}
                className="cph-table__filter-multi__option"
              >
                {({ isSelected }) => (
                  <>
                    <span
                      className={`cph-table__filter-multi__checkbox${
                        isSelected ? " cph-table__filter-multi__checkbox--checked" : ""
                      }`}
                      aria-hidden="true"
                    >
                      {isSelected && <Check size={12} />}
                    </span>
                    <span className="cph-table__filter-multi__option-label">{option.label}</span>
                  </>
                )}
              </ListBoxItem>
            ))}
          </ListBox>
        </Popover>
      </DialogTrigger>
      {clearable && value.length > 0 && (
        <Button
          className="cph-table__filter-multi__clear"
          aria-label={`Clear ${ariaLabel} filter`}
          onPress={handleClear}
          data-testid="filter-multi-clear"
        >
          <X size={14} aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
