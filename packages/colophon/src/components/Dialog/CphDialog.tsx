/**
 * CphDialog — accessible dialog/modal primitive.
 * Placement variants: modal (centered), bottom (sheet), right (drawer), fullscreen.
 * Uses react-aria-components (Dialog, Modal, ModalOverlay, Heading, etc.).
 * NO play function in stories (per AGENTS.md note).
 */
import { X } from "lucide-react";
import type { ReactNode, CSSProperties } from "react";
import { Dialog, DialogTrigger, Heading, Modal, ModalOverlay, Button } from "react-aria-components";

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
  /** Focus trap behavior */
  focusTrap?: boolean;
  /** Lock scroll on open */
  scrollLock?: boolean;
  /** Close callback (Esc / overlay click) */
  onClose?: () => void;
  /** Footer content */
  footer?: ReactNode;
  /** Additional class names */
  className?: string;
  /** Trigger element; if omitted, no trigger is rendered (controlled mode) */
  trigger?: ReactNode;
  /** Accessible label used when no visible title is supplied */
  "aria-label"?: string;
  /** Inline styles forwarded to dialog */
  style?: CSSProperties;
  /** Dialog content */
  children?: ReactNode;
}

export function CphDialog({
  isOpen,
  defaultOpen,
  onOpenChange,
  title,
  description,
  size = "md",
  placement = "modal",
  focusTrap = true,
  scrollLock = true,
  onClose,
  footer,
  className = "",
  trigger,
  "aria-label": ariaLabel,
  style,
  children,
}: CphDialogProps) {
  // Build className from placement and size
  const placementClass = `cph-dialog--${placement}`;
  const sizeClass = `cph-dialog--${size}`;
  const classes = `cph-dialog ${placementClass} ${sizeClass} ${className}`.trim();

  const triggerProps =
    isOpen !== undefined ? { isOpen } : defaultOpen !== undefined ? { defaultOpen } : {};
  const openChangeProp = onOpenChange ? { onOpenChange } : {};

  return (
    <DialogTrigger {...triggerProps} {...openChangeProp}>
      {trigger ? <>{trigger}</> : <Button className="cph-dialog-trigger">Open</Button>}
      <ModalOverlay isDismissable isKeyboardDismissDisabled={false} className="cph-dialog-overlay">
        <Modal className="cph-dialog-modal">
          <div className={classes} style={style}>
            <Dialog
              className="cph-dialog-inner"
              {...(ariaLabel !== undefined ? { "aria-label": ariaLabel } : {})}
            >
              <div className="cph-dialog-heading">
                {title && (
                  <Heading slot="title" className="cph-dialog-title">
                    {title}
                  </Heading>
                )}
                <Button
                  className="cph-dialog-close"
                  onPress={() => {
                    onOpenChange?.(false);
                    onClose?.();
                  }}
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </Button>
              </div>
              {description && <p className="cph-dialog-description">{description}</p>}
              <div className="cph-dialog-body">{children}</div>
              {footer && <div className="cph-dialog-footer">{footer}</div>}
            </Dialog>
          </div>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}
