/**
 * CphDialog — accessible dialog/modal primitive.
 * Placement variants: modal (centered), bottom (sheet), right (drawer), fullscreen.
 * Uses react-aria-components (Dialog, Modal, ModalOverlay, Heading, etc.).
 * NO play function in stories (per AGENTS.md note).
 */
import { X } from "lucide-react";
import {
  useEffect,
  useId,
  type CSSProperties,
  type DOMAttributes,
  type ReactElement,
  type ReactNode,
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

export interface CphDialogProps {
  /** Whether dialog is open (controlled) */
  isOpen?: boolean;
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Title content */
  title?: ReactNode;
  /** Description content */
  description?: ReactNode;
  /** Size: sm / md / lg */
  size?: "sm" | "md" | "lg";
  /** Placement variant */
  placement?: "modal" | "bottom" | "right" | "fullscreen";
  /**
   * Focus trap behavior. Note: React Aria's Modal always traps focus; this prop is
   * retained for API stability and does not disable the trap.
   */
  focusTrap?: boolean;
  /** Lock body scroll while the dialog is open (default true) */
  scrollLock?: boolean;
  /** Callback fired on any close: Esc, overlay click, trigger toggle, or close button */
  onClose?: () => void;
  /** Footer content */
  footer?: ReactNode;
  /** Additional class names */
  className?: string;
  /** Trigger element; omitted renders a default "Open" button */
  trigger?: ReactNode;
  /** Accessible label used when no visible title is supplied */
  "aria-label"?: string;
  /** Inline styles forwarded to dialog */
  style?: CSSProperties;
  /** Dialog content */
  children?: ReactNode;
}

function useBodyScrollLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled) {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [enabled]);
}

function DialogSurface({
  title,
  description,
  titleId,
  descriptionId,
  ariaLabel,
  placement,
  size,
  className,
  style,
  footer,
  scrollLock,
  children,
}: {
  title?: ReactNode;
  description?: ReactNode;
  titleId: string;
  descriptionId: string;
  ariaLabel?: string | undefined;
  placement: string;
  size: string;
  className: string;
  style?: CSSProperties | undefined;
  footer?: ReactNode;
  scrollLock: boolean;
  children?: ReactNode;
}) {
  useBodyScrollLock(scrollLock);

  const classes = `cph-dialog cph-dialog--${placement} cph-dialog--${size} ${className}`.trim();

  return (
    <div className={classes} style={style}>
      <Dialog
        className="cph-dialog-inner"
        {...(title ? { "aria-labelledby": titleId } : {})}
        {...(description ? { "aria-describedby": descriptionId } : {})}
        {...(ariaLabel !== undefined ? { "aria-label": ariaLabel } : {})}
      >
        <div className="cph-dialog-heading">
          {title && (
            <Heading id={titleId} slot="title" className="cph-dialog-title">
              {title}
            </Heading>
          )}
          <Button className="cph-dialog-close" slot="close" aria-label="Close dialog">
            <X size={18} />
          </Button>
        </div>
        {description && (
          <p id={descriptionId} className="cph-dialog-description">
            {description}
          </p>
        )}
        <div className="cph-dialog-body">{children}</div>
        {footer && <div className="cph-dialog-footer">{footer}</div>}
      </Dialog>
    </div>
  );
}

export function CphDialog({
  isOpen,
  defaultOpen,
  onOpenChange,
  title,
  description,
  size = "md",
  placement = "modal",
  scrollLock = true,
  onClose,
  footer,
  className = "",
  trigger,
  "aria-label": ariaLabel,
  style,
  children,
}: CphDialogProps) {
  const uid = useId().replace(/[^a-zA-Z0-9-_]/g, "");
  const titleId = `cph-dialog-title-${uid}`;
  const descriptionId = `cph-dialog-description-${uid}`;

  const handleOpenChange = (open: boolean) => {
    onOpenChange?.(open);
    if (!open) {
      onClose?.();
    }
  };

  const triggerProps =
    isOpen !== undefined ? { isOpen } : defaultOpen !== undefined ? { defaultOpen } : {};
  const openChangeProp = onOpenChange || onClose ? { onOpenChange: handleOpenChange } : {};

  return (
    <DialogTrigger {...triggerProps} {...openChangeProp}>
      {trigger ? (
        <Pressable>{trigger as ReactElement<DOMAttributes<FocusableElement>, string>}</Pressable>
      ) : (
        <Button className="cph-dialog-trigger">Open</Button>
      )}
      <ModalOverlay isDismissable isKeyboardDismissDisabled={false} className="cph-dialog-overlay">
        <Modal className="cph-dialog-modal">
          <DialogSurface
            title={title}
            description={description}
            titleId={titleId}
            descriptionId={descriptionId}
            ariaLabel={ariaLabel}
            placement={placement}
            size={size}
            className={className}
            style={style}
            footer={footer}
            scrollLock={scrollLock}
          >
            {children}
          </DialogSurface>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}
