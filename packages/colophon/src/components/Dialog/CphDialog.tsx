import { X } from "lucide-react";
import { useCallback, useEffect, useId, useState, type CSSProperties, type ReactNode } from "react";
import { Button, Dialog, Heading, Modal, ModalOverlay } from "react-aria-components";

/** Chrome and anchor preset for the dialog. */
export type CphDialogPlacement = "modal" | "bottom" | "right" | "fullscreen";

/** Width preset used by the `modal` and `right` placements. */
export type CphDialogSize = "sm" | "md" | "lg";

export interface CphDialogProps {
  /** Dialog content, rendered in the scrollable body region. */
  children: ReactNode;
  /** Controlled open state. */
  isOpen?: boolean | undefined;
  /** Uncontrolled initial open state. Defaults to `false`. */
  defaultOpen?: boolean | undefined;
  /** Called whenever the open state changes, including dismissal paths. */
  onOpenChange?: ((isOpen: boolean) => void) | undefined;
  /** Header title. Doubles as the accessible dialog name. */
  title?: ReactNode | undefined;
  /** Secondary line under the title; exposed as the dialog description. */
  description?: ReactNode | undefined;
  /** Accessible name to supply when no visible title is set. */
  "aria-label"?: string | undefined;
  /** Width preset for the `modal` and `right` placements. Defaults to `"md"`. */
  size?: CphDialogSize | undefined;
  /** Placement preset. Defaults to `"modal"` (centred over a backdrop). */
  placement?: CphDialogPlacement | undefined;
  /**
   * Whether focus stays contained while the dialog is open. Defaults to
   * `true` for `modal` and `right`, and `false` for `bottom` and
   * `fullscreen`. With `false` the dialog renders as a non-modal fixed
   * layer, without a backdrop, and Tab may move focus back outside.
   */
  focusTrap?: boolean | undefined;
  /** Lock body scroll while the dialog is open. Defaults to `true`. */
  scrollLock?: boolean | undefined;
  /** Fired once the dialog has closed through any dismissal path. */
  onClose?: (() => void) | undefined;
  /** Footer content, typically action buttons. */
  footer?: ReactNode | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
}

/**
 * An accessible dialog with four placement presets: centred `modal`,
 * `bottom` sheet, `right` drawer, and `fullscreen`. Built on the React Aria
 * `Dialog` primitive: the header is wired to `aria-labelledby`, Esc and
 * outside-press dismissal come from the overlay when focus is trapped, and
 * the close affordance closes through the same controlled flow.
 *
 * When `focusTrap` resolves to `true` the dialog renders through a modal
 * overlay, so focus is contained and body scroll is prevented. With
 * `false` it renders inside a fixed non-modal layer; Esc and the close
 * button still work, but focus is left unmanaged.
 */
export function CphDialog({
  children,
  isOpen,
  defaultOpen,
  onOpenChange,
  title,
  description,
  "aria-label": ariaLabel,
  size = "md",
  placement = "modal",
  focusTrap,
  scrollLock = true,
  onClose,
  footer,
  className,
  style,
}: CphDialogProps) {
  const trapsFocus = focusTrap ?? (placement === "modal" || placement === "right");
  const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
  const isControlled = isOpen !== undefined;
  const open = isControlled ? (isOpen as boolean) : internalOpen;
  const descriptionId = useId();

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
      if (!next) {
        onClose?.();
      }
    },
    [isControlled, onOpenChange, onClose],
  );

  // The non-modal layer leaves dismissal to us; the overlay handles Esc itself.
  useEffect(() => {
    if (!open || trapsFocus || !scrollLock) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, trapsFocus, scrollLock]);

  useEffect(() => {
    if (!open || trapsFocus) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, trapsFocus, setOpen]);

  if (!open) {
    return null;
  }

  const classNameProp = `cph-dialog cph-dialog--${placement} cph-dialog--${size} ${
    className ?? ""
  }`.trim();
  const layerClassName = `cph-dialog__layer cph-dialog__layer--${placement}`;
  const header = (
    <div className="cph-dialog__heading">
      {title !== undefined && <Heading slot="title">{title}</Heading>}
      <Button
        className="cph-dialog__close"
        aria-label="Close dialog"
        onPress={() => setOpen(false)}
      >
        <X size={16} aria-hidden />
      </Button>
    </div>
  );

  const dialog = (
    <Dialog
      className={classNameProp}
      {...(style !== undefined ? { style } : {})}
      {...(ariaLabel !== undefined ? { "aria-label": ariaLabel } : {})}
      {...(description !== undefined ? { "aria-describedby": descriptionId } : {})}
    >
      {header}
      {description !== undefined && (
        <p id={descriptionId} className="cph-dialog__description">
          {description}
        </p>
      )}
      <div className="cph-dialog__body">{children}</div>
      {footer !== undefined && <div className="cph-dialog__footer">{footer}</div>}
    </Dialog>
  );

  if (!trapsFocus) {
    return <div className={layerClassName}>{dialog}</div>;
  }

  return (
    <ModalOverlay
      className="cph-dialog__overlay"
      isDismissable
      isOpen={open}
      onOpenChange={setOpen}
    >
      <Modal className={`cph-dialog__modal cph-dialog__modal--${placement}`}>{dialog}</Modal>
    </ModalOverlay>
  );
}
