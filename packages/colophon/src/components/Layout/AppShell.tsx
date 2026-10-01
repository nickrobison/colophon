import { type ReactNode } from "react";
export interface AppShellProps {
  sidebar?: ReactNode;
  bottomNav?: ReactNode;
  header?: ReactNode;
  children: ReactNode;
}
export function AppShell({ sidebar, bottomNav, header, children }: AppShellProps) {
  return (
    <div className="cph-app-shell" data-theme="light" data-density="comfortable">
      {sidebar && <aside className="cph-sidebar">{sidebar}</aside>}
      {bottomNav && <nav aria-label="Primary navigation" className="cph-bottom-nav">{bottomNav}</nav>}
      <main className="cph-main">
        {header && <header className="cph-topbar">{header}</header>}
        <div className="cph-content">{children}</div>
      </main>
    </div>
  );
}
