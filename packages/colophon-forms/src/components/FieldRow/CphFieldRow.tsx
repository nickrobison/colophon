import type { ReactElement, ReactNode } from "react";

export interface CphFieldRowProps {
  children: ReactNode;
  className?: string;
}

export function CphFieldRow(props: CphFieldRowProps): ReactElement {
  const { children, className = "" } = props;
  return <div className={`cph-form__row ${className}`}>{children}</div>;
}
