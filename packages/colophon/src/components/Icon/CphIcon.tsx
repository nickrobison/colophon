import { Archive, ArrowRight, BookOpen, ChevronDown, Compass, LayoutGrid, Layers, List, Moon, Search, Sparkles, Sun, ListOrdered, type LucideIcon } from "lucide-react";
export type CphIconName = "archive"|"arrow"|"book"|"chevron"|"compass"|"grid"|"layers"|"list"|"moon"|"search"|"spark"|"sun"|"timeline";
const MAP: Record<CphIconName, LucideIcon> = { archive: Archive, arrow: ArrowRight, book: BookOpen, chevron: ChevronDown, compass: Compass, grid: LayoutGrid, layers: Layers, list: List, moon: Moon, search: Search, spark: Sparkles, sun: Sun, timeline: ListOrdered };
export function CphIcon({ name, size = 18, "aria-label": ariaLabel }: { name: CphIconName; size?: number; "aria-label"?: string }) {
  const Cmp = MAP[name];
  return <Cmp size={size} aria-hidden={ariaLabel ? undefined : true} aria-label={ariaLabel} className="cph-icon" />;
}
