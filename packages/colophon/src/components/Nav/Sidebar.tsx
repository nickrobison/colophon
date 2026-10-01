import { useState, type ReactNode } from "react";
import { Button } from "react-aria-components";

import { CphFieldNote } from "../FieldNote/FieldNote";
import { CphIcon } from "../Icon/CphIcon";
import { CphNavMenu } from "./NavMenu";
import { CphNavSection } from "./NavSection";
import type { CphNavItem } from "./types";

export interface CphSidebarProps {
  brand: { mark: string; name: string; subtitle: string };
  sectionTitle: string;
  navItems: CphNavItem[];
  note?: { index: string; quote: string; caption?: string };
  profile: { initials: string; name: string; role: string };
  defaultSelectedId?: string;
  onSelect?: (id: string) => void;
  children?: ReactNode;
}

/**
 * Persistent graphite sidebar — brand, collapsible nav section, field note,
 * profile block. Renders on graphite in both themes (text tokens fixed).
 */
export function CphSidebar({
  brand,
  sectionTitle,
  navItems,
  note,
  profile,
  defaultSelectedId,
  onSelect,
  children,
}: CphSidebarProps) {
  const [selectedId, setSelectedId] = useState<string | undefined>(defaultSelectedId);
  return (
    <div className="cph-sidebar__inner">
      <div className="cph-brand">
        <span className="cph-brand__mark">{brand.mark}</span>
        <div>
          <strong>{brand.name}</strong>
          <small>{brand.subtitle}</small>
        </div>
      </div>

      <CphNavSection title={sectionTitle}>
        <CphNavMenu
          aria-label={sectionTitle}
          items={navItems}
          {...(selectedId ? { selectedId } : {})}
          onSelect={(id) => {
            setSelectedId(id);
            onSelect?.(id);
          }}
        />
      </CphNavSection>

      {children}

      {note ? (
        <CphFieldNote
          index={note.index}
          quote={note.quote}
          {...(note.caption ? { caption: note.caption } : {})}
        />
      ) : null}

      <div className="cph-profile">
        <span className="cph-profile__avatar" aria-hidden="true">
          {profile.initials}
        </span>
        <div>
          <strong>{profile.name}</strong>
          <small>{profile.role}</small>
        </div>
        <Button aria-label="Account options" className="cph-icon-button">
          <CphIcon name="chevron" size={16} />
        </Button>
      </div>
    </div>
  );
}
