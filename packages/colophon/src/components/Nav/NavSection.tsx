import { Button, Disclosure, DisclosurePanel } from "react-aria-components";
import type { ReactNode } from "react";
import { CphIcon } from "../Icon/CphIcon";

export interface CphNavSectionProps {
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
}

/** Collapsible navigation section — react-aria Disclosure with slot="trigger". */
export function CphNavSection({ title, children, defaultExpanded = true }: CphNavSectionProps) {
  return (
    <Disclosure className="cph-nav-section" defaultExpanded={defaultExpanded}>
      <Button slot="trigger" className="cph-nav-section__trigger">
        <span className="cph-eyebrow">{title}</span>
        <CphIcon name="chevron" size={14} />
      </Button>
      <DisclosurePanel className="cph-nav-section__panel">{children}</DisclosurePanel>
    </Disclosure>
  );
}
