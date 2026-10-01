import type { Key } from "react";
import { ListBox, ListBoxItem } from "react-aria-components";

import { CphIcon } from "../Icon/CphIcon";
import type { CphNavItem } from "./types";

export interface CphBottomNavProps {
  items: CphNavItem[];
  "aria-label": string;
  selectedId?: string;
  onSelect?: (id: string) => void;
}

/**
 * Mobile bottom navigation (thumb reach). Takes over below 820px where the
 * sidebar nav collapses. Short text labels always visible (spec §4).
 */
export function CphBottomNav({
  items,
  "aria-label": ariaLabel,
  selectedId,
  onSelect,
}: CphBottomNavProps) {
  return (
    <ListBox
      aria-label={ariaLabel}
      className="cph-bottom-nav"
      orientation="horizontal"
      selectionMode="single"
      {...(selectedId !== undefined ? { selectedKeys: [selectedId] } : {})}
      onSelectionChange={(keys) => {
        const first = [...keys][0] as Key | undefined;
        if (typeof first === "string") onSelect?.(first);
      }}
    >
      {items.map((item) => (
        <ListBoxItem
          key={item.id}
          id={item.id}
          textValue={item.label}
          className="cph-bottom-nav__item"
        >
          {item.icon ? <CphIcon name={item.icon} size={20} /> : null}
          <span className="cph-bottom-nav__label">{item.label}</span>
        </ListBoxItem>
      ))}
    </ListBox>
  );
}
