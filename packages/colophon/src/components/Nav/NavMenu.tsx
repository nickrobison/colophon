import type { Key } from "react";
import { ListBox, ListBoxItem } from "react-aria-components";

import { CphIcon } from "../Icon/CphIcon";
import type { CphNavItem } from "./types";

export interface CphNavMenuProps {
  items: CphNavItem[];
  "aria-label": string;
  selectedId?: string;
  onSelect?: (id: string) => void;
}

/** Vertical primary navigation — pure react-aria ListBox. No Radix. */
export function CphNavMenu({
  items,
  "aria-label": ariaLabel,
  selectedId,
  onSelect,
}: CphNavMenuProps) {
  return (
    <ListBox
      aria-label={ariaLabel}
      className="cph-nav"
      selectionMode="single"
      {...(selectedId !== undefined ? { selectedKeys: [selectedId] } : {})}
      onSelectionChange={(keys) => {
        const first = [...keys][0] as Key | undefined;
        if (typeof first === "string") onSelect?.(first);
      }}
    >
      {items.map((item) => (
        <ListBoxItem key={item.id} id={item.id} textValue={item.label} className="cph-nav__item">
          {item.icon ? <CphIcon name={item.icon} /> : null}
          <span className="cph-nav__label">{item.label}</span>
          {item.count !== undefined ? <span className="cph-nav__count">{item.count}</span> : null}
        </ListBoxItem>
      ))}
    </ListBox>
  );
}
