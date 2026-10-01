import { type ReactNode } from "react";
export interface MainContentProps { children: ReactNode }
export function MainContent({ children }: MainContentProps) {
  return <div className="cph-main-content">{children}</div>;
}
