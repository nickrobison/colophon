import { Button, type ButtonProps } from "react-aria-components";
import type { ReactNode } from "react";
export interface CphButtonProps extends ButtonProps { children: ReactNode; variant?: "primary" | "secondary" | "text" | "icon" | "nav"; className?: string }
export function CphButton({ children, variant = "primary", className = "", ...rest }: CphButtonProps) {
  return <Button className={`cph-btn cph-btn--${variant} ${className}`} {...rest}>{children}</Button>;
}
