import type { CphNavItem, CphGraphNode } from "@nickrobison/colophon";

export const navItems: CphNavItem[] = [
  { id: "overview", label: "Overview", icon: "grid" },
  { id: "explore", label: "Explore", icon: "compass" },
  { id: "collections", label: "Collections", icon: "layers", count: 8 },
  { id: "chronologies", label: "Chronologies", icon: "timeline" },
  { id: "archive", label: "Archive", icon: "archive" },
];

export const signals = [
  { mark: "Ⅰ", value: "12,483", delta: "+8.4%", label: "Sources indexed" },
  { mark: "Ⅱ", value: "2,941", delta: "+124", label: "Active concepts" },
  { mark: "Ⅲ", value: "38,205", delta: "+12.1%", label: "Relationships" },
  { mark: "Ⅳ", value: "17", delta: "3 urgent", label: "Open inquiries", urgent: true },
];

export const topics = [
  { name: "Scientific method", value: 92, count: "842 sources" },
  { name: "Natural philosophy", value: 75, count: "615 sources" },
  { name: "Epistemology", value: 64, count: "491 sources" },
  { name: "Political economy", value: 48, count: "328 sources" },
];

export const rows = [
  {
    id: "KPL-041",
    inquiry: "The observable roots of civic order",
    owner: "Ada Mercer",
    sources: 128,
    stageLabel: "Synthesis",
    updated: "12 min ago",
    note: "The corpus now supports a direct comparison between Baconian observation and emerging theories of public utility.",
    concepts: ["Empiricism", "Civic order", "Public utility"],
  },
  {
    id: "KPL-038",
    inquiry: "Rousseau's natural citizen",
    owner: "Jon Bell",
    sources: 84,
    stageLabel: "Analysis",
    updated: "Yesterday",
    note: "Seven annotations remain contested, primarily around translations of volonté générale in the 1762 editions.",
    concepts: ["Rousseau", "Sovereignty", "Translation"],
  },
  {
    id: "KPL-029",
    inquiry: "Skepticism after Hume",
    owner: "Mira Chen",
    sources: 211,
    stageLabel: "Complete",
    updated: "03 Jun",
    note: "Peer review is complete. The inquiry is ready to join the published chronology of modern epistemology.",
    concepts: ["Hume", "Skepticism", "Causality"],
  },
];

export const graphNodes: CphGraphNode[] = [
  { id: "empiricism", cx: 101, cy: 82, r: 7, label: "EMPIRICISM", lx: 115, ly: 82, ta: "start" },
  { id: "hume", cx: 165, cy: 264, r: 5, label: "HUME", lx: 178, ly: 264, ta: "start" },
  { id: "bacon", cx: 246, cy: 142, r: 11, label: "BACON", lx: 246, ly: 122, ta: "middle" },
  { id: "skepticism", cx: 330, cy: 249, r: 7, label: "SKEPTICISM", lx: 318, ly: 249, ta: "end" },
  { id: "rationalism", cx: 359, cy: 72, r: 6, label: "RATIONALISM", lx: 373, ly: 72, ta: "start" },
  { id: "rousseau", cx: 432, cy: 273, r: 6, label: "ROUSSEAU", lx: 432, ly: 258, ta: "middle" },
  {
    id: "enlightenment",
    cx: 489,
    cy: 135,
    r: 13,
    label: "ENLIGHTENMENT",
    lx: 489,
    ly: 113,
    ta: "middle",
    primary: true,
  },
  {
    id: "social",
    cx: 579,
    cy: 257,
    r: 8,
    label: "SOCIAL CONTRACT",
    lx: 579,
    ly: 240,
    ta: "middle",
  },
  { id: "deism", cx: 650, cy: 73, r: 5, label: "DEISM", lx: 638, ly: 73, ta: "end" },
  { id: "kant", cx: 688, cy: 191, r: 7, label: "KANT", lx: 674, ly: 191, ta: "end" },
];

export const graphEdges = [
  "M101 82 246 142 359 72 489 135 650 73",
  "M246 142 330 249 489 135 579 257",
  "M101 82 165 264 330 249 579 257 688 191",
  "M359 72 432 273M489 135 688 191M330 249 432 273",
];
