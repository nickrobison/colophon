import type { ReactNode } from "react";
export interface CphContentProps {
  children: ReactNode;
  maxWidth?: "default" | "wide";
}
/** Content column inside the shell. Nothing may exceed the viewport width. */
export function CphContent({ children, maxWidth = "default" }: CphContentProps) {
  return <div className={`cph-content cph-content--${maxWidth}`}>{children}</div>;
}
