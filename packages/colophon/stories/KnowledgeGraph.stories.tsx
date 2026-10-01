import type { Meta, StoryObj } from "@storybook/react";

import {
  CphKnowledgeGraph,
  type CphGraphNode,
} from "../src/components/KnowledgeGraph/KnowledgeGraph";
const nodes: CphGraphNode[] = [
  { id: "empiricism", cx: 101, cy: 82, r: 7, label: "EMPIRICISM", lx: 115, ly: 82, ta: "start" },
  { id: "bacon", cx: 246, cy: 142, r: 11, label: "BACON", lx: 246, ly: 122, ta: "middle" },
  { id: "hume", cx: 165, cy: 264, r: 5, label: "HUME", lx: 178, ly: 264, ta: "start" },
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
const edges = [
  "M101 82 246 142 359 72 489 135 650 73",
  "M246 142 330 249 489 135 579 257",
  "M101 82 165 264 330 249 579 257 688 191",
  "M359 72 432 273M489 135 688 191M330 249 432 273",
];
const meta: Meta<typeof CphKnowledgeGraph> = {
  title: "Colophon/KnowledgeGraph",
  component: CphKnowledgeGraph,
  args: {
    nodes,
    edges,
    label:
      "Knowledge graph: intellectual lineages connecting Empiricism, Bacon, Rationalism, Enlightenment, Hume, Skepticism, Rousseau, Social Contract, Deism, and Kant",
  },
};
export default meta;
type S = StoryObj<typeof CphKnowledgeGraph>;
export const Default: S = {
  render: (a) => (
    <div>
      <CphKnowledgeGraph {...a} />
      <div className="cph-legend">
        <span>
          <i className="cph-graph__dot cph-graph__dot--primary" aria-hidden="true" />
          Highlighted cluster
        </span>
        <span>
          <i className="cph-graph__dot" aria-hidden="true" />
          Adjacent concept
        </span>
      </div>
    </div>
  ),
};
