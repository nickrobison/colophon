export interface CphGraphNode {
  id: string;
  cx: number;
  cy: number;
  r: number;
  label: string;
  lx: number;
  ly: number;
  ta: "start" | "middle" | "end";
  primary?: boolean;
}
export function CphKnowledgeGraph({
  nodes,
  edges,
  label,
}: {
  nodes: CphGraphNode[];
  edges: string[];
  label: string;
}) {
  return (
    <svg aria-label={label} className="cph-graph" role="img" viewBox="0 0 760 310">
      <g className="cph-graph__lines">
        {edges.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
      {nodes.map((n) => (
        <g
          key={n.id}
          className="cph-graph__node"
          role="img"
          aria-label={n.label + (n.primary ? " — highlighted cluster" : "")}
          tabIndex={0}
        >
          <circle className="cph-graph__hit" cx={n.cx} cy={n.cy} r={24} />
          <circle
            className={`cph-graph__dot${n.primary ? " cph-graph__dot--primary" : ""}`}
            cx={n.cx}
            cy={n.cy}
            r={n.r}
          />
          <text
            className={`cph-graph__label${n.primary ? " cph-graph__label--primary" : ""}`}
            x={n.lx}
            y={n.ly}
            dy="0.35em"
            textAnchor={n.ta}
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
