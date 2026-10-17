import { Loader } from "lucide-react";
import type { ReactNode } from "react";
import { Button, type ButtonProps } from "react-aria-components";
export interface CphButtonProps extends ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "text" | "icon" | "nav";
  className?: string;
  isLoading?: boolean;
  loadingText?: string;
}
export function CphButton({
  children,
  variant = "primary",
  className = "",
  isLoading = false,
  loadingText,
  ...rest
}: CphButtonProps) {
  const baseProps: Record<string, unknown> = {
    ...rest,
    className:
      `cph-btn cph-btn--${variant} ${isLoading ? "cph-btn--loading" : ""} ${className}`.trim(),
  };
  if (rest.isDisabled || isLoading) {
    baseProps.isDisabled = true;
  } else if (rest.isDisabled === false) {
    baseProps.isDisabled = false;
  }
  return (
    <Button {...baseProps}>
      {isLoading ? (
        <span aria-busy="true">
          <Loader size={16} aria-hidden={true} className="cph-spin" />
          {loadingText ? loadingText : children}
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
