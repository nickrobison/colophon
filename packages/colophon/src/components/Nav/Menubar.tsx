import { Tab, TabList, Tabs } from "react-aria-components";
import type { Key } from "react";
import type { CphIconName } from "../Icon/CphIcon";
import { CphIcon } from "../Icon/CphIcon";

export interface CphMenubarItem {
  id: string;
  label: string;
  icon?: CphIconName;
}
export interface CphMenubarProps {
  items: CphMenubarItem[];
  "aria-label": string;
  selectedId?: string;
  onSelect?: (id: string) => void;
}

/**
 * Horizontal menubar. Pure react-aria Tabs (selectedKey/onSelectionChange live
 * on Tabs, not TabList; roving tabindex + arrow keys per WAI-ARIA). No Radix.
 */
export function CphMenubar({ items, "aria-label": ariaLabel, selectedId, onSelect }: CphMenubarProps) {
  return (
    <Tabs
      aria-label={ariaLabel}
      orientation="horizontal"
      {...(selectedId !== undefined ? { selectedKey: selectedId } : {})}
      onSelectionChange={(key: Key) => {
        if (typeof key === "string") onSelect?.(key);
      }}
    >
      <TabList className="cph-menubar">
        {items.map((item) => (
          <Tab key={item.id} id={item.id} className="cph-menubar__tab">
            {item.icon ? <CphIcon name={item.icon} size={16} /> : null}
            <span>{item.label}</span>
          </Tab>
        ))}
      </TabList>
    </Tabs>
  );
}
