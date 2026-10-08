/** @packageDocumentation Mobile sort/filter sheet dialog. */

import { X } from "lucide-react";
import type { HTMLAttributes, ReactNode, ReactElement, DOMAttributes } from "react";
import {
  Button,
  Dialog,
  DialogTrigger,
  Heading,
  Modal,
  ModalOverlay,
  Pressable,
  type FocusableElement,
} from "react-aria-components";

import { composeClassName } from "../../utils/composeClassName";

export interface CphSortFilterSheetProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "aria-label" | "aria-labelledby" | "aria-describedby"
> {
  /** Content to render inside the sheet. */
  children: ReactNode;
  /** Whether sheet is open (controlled). */
  isOpen?: boolean;
  /** Default open state (uncontrolled). */
  defaultOpen?: boolean;
  /** Callback when sheet open state changes. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Title for the sheet. */
  title?: string;
  /** Description for the sheet. */
  description?: string;
  /** Trigger element to open the sheet. */
  trigger?: ReactNode;
  /** Accessible name used when no visible title is supplied. */
  "aria-label"?: string | undefined;
}

export function CphSortFilterSheet({
  children,
  isOpen,
  defaultOpen,
  onOpenChange,
  title = "Sort & Filter",
  description,
  trigger,
  "aria-label": ariaLabel,
  id,
  className,
}: CphSortFilterSheetProps) {
  const handleClose = () => onOpenChange?.(false);

  // For native elements, composeClassName may return a function (render-props callback).
  // We need to resolve it to a string for native DOM elements.
  const dialogClassName = (() => {
    const composed = composeClassName("cph-table__sheet", className);
    return typeof composed === "function" ? composed({ defaultClassName: undefined }) : composed;
  })();

  return (
    <DialogTrigger
      {...(isOpen !== undefined ? { isOpen } : {})}
      {...(defaultOpen !== undefined ? { defaultOpen } : {})}
      {...(onOpenChange ? { onOpenChange } : {})}
    >
      {trigger ? (
        <Pressable>{trigger as ReactElement<DOMAttributes<FocusableElement>, string>}</Pressable>
      ) : (
        <Button aria-label="Open sort & filter">Sort & Filter</Button>
      )}
      <ModalOverlay
        isDismissable
        isKeyboardDismissDisabled={false}
        className={composeClassName("cph-table__sheet-overlay", undefined)}
      >
        <Modal className={composeClassName("cph-table__sheet-modal", undefined)}>
          <div aria-modal="true" data-testid="sort-filter-sheet-modal">
            <Dialog
              className={dialogClassName}
              {...(ariaLabel !== undefined ? { "aria-label": ariaLabel } : {})}
              {...(title ? { "aria-labelledby": "cph-sort-filter-sheet-title" } : {})}
              {...(description ? { "aria-describedby": "cph-sort-filter-sheet-description" } : {})}
              {...(id !== undefined ? { id } : {})}
              data-cph-table="sort-filter-sheet"
              data-testid="sort-filter-sheet"
            >
              <div className="cph-table__sheet-heading">
                <Heading id="cph-sort-filter-sheet-title" slot="title">
                  {title}
                </Heading>
                <Button
                  className="cph-table__sheet-close"
                  onPress={handleClose}
                  aria-label="Close sort & filter"
                >
                  <X size={20} />
                </Button>
              </div>
              {description && (
                <p id="cph-sort-filter-sheet-description" className="cph-table__sheet-description">
                  {description}
                </p>
              )}
              <div className="cph-table__sheet-content" aria-modal="true">
                {children}
              </div>
              <div className="cph-table__sheet-actions">
                <Button className="cph-table__sheet-action-btn" onPress={handleClose} slot="close">
                  Done
                </Button>
              </div>
            </Dialog>
          </div>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}
