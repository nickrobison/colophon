/** @packageDocumentation Mobile sort/filter sheet dialog. */

import { X } from "lucide-react";
import {
  useId,
  type CSSProperties,
  type ReactNode,
  type ReactElement,
  type DOMAttributes,
} from "react";
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

export interface CphSortFilterSheetProps {
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
  /** DOM id forwarded to the dialog. */
  id?: string | undefined;
  /** Additional class names for the dialog. */
  className?: string | undefined;
  /** Inline styles forwarded to the dialog. */
  style?: CSSProperties | undefined;
  /** Extra data attributes forwarded to the dialog. */
  [key: `data-${string}`]: string | undefined;
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
  style,
  ...dataAttrs
}: CphSortFilterSheetProps) {
  const uid = useId().replace(/[^a-zA-Z0-9-_]/g, "");
  const titleId = `cph-sort-filter-sheet-title-${uid}`;
  const descriptionId = `cph-sort-filter-sheet-description-${uid}`;
  const handleClose = () => onOpenChange?.(false);

  // className is a plain string here, so composition always resolves to a string.
  const dialogClassName = composeClassName("cph-table__sheet", className) as string;

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
              {...dataAttrs}
              className={dialogClassName}
              {...(style !== undefined ? { style } : {})}
              {...(ariaLabel !== undefined ? { "aria-label": ariaLabel } : {})}
              aria-labelledby={titleId}
              {...(description ? { "aria-describedby": descriptionId } : {})}
              {...(id !== undefined ? { id } : {})}
              data-cph-table="sort-filter-sheet"
              data-testid="sort-filter-sheet"
            >
              <div className="cph-table__sheet-heading">
                <Heading id={titleId} slot="title">
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
                <p id={descriptionId} className="cph-table__sheet-description">
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
