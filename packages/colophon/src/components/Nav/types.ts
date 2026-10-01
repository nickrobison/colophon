import type { ReactNode } from "react";

import type { CphIconName } from "../Icon/CphIcon";
export interface CphNavItem {
  id: string;
  label: string;
  icon?: CphIconName;
  count?: number;
  children?: ReactNode;
}
