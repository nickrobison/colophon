import type { ReactNode } from "react";

import { CphBottomNav, type CphBottomNavProps } from "../Nav/BottomNav";
import { CphSidebar, type CphSidebarProps } from "../Nav/Sidebar";
import { CphTopBar } from "../Nav/TopBar";

export interface CphAppShellProps {
  /** Pass the sidebar config and it renders inside the graphite rail. */
  sidebar?: CphSidebarProps;
  /** Pass the nav items and it renders the mobile bottom bar. */
  bottomNav?: Omit<CphBottomNavProps, "aria-label">;
  header?: ReactNode;
  topBarLeading?: ReactNode;
  topBarActions?: ReactNode;
  children: ReactNode;
}

/**
 * Application layout shell — graphite sidebar, sticky topbar, content column,
 * mobile bottom navigation. Desktop first; collapses at 820px (spec §4).
 */
export function CphAppShell({
  sidebar,
  bottomNav,
  header,
  topBarLeading,
  topBarActions,
  children,
}: CphAppShellProps) {
  const navItems = bottomNav?.items ?? sidebar?.navItems;
  return (
    <div className="cph-app-shell">
      {sidebar ? (
        <aside className="cph-sidebar">
          <CphSidebar {...sidebar} />
        </aside>
      ) : null}

      <main className="cph-main">
        <CphTopBar
          {...(topBarLeading ? { leading: topBarLeading } : {})}
          {...(topBarActions ? { actions: topBarActions } : {})}
        >
          {header}
        </CphTopBar>
        <div className="cph-content">{children}</div>
      </main>

      {navItems ? (
        <CphBottomNav
          aria-label="Primary navigation"
          items={navItems}
          {...(bottomNav?.selectedId ? { selectedId: bottomNav.selectedId } : {})}
          {...(bottomNav?.onSelect ? { onSelect: bottomNav.onSelect } : {})}
        />
      ) : null}
    </div>
  );
}
