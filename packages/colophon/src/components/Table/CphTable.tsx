import { useState } from "react";
import { Button } from "react-aria-components";
export interface CphRow {
  id: string;
  inquiry: string;
  owner: string;
  sources: number;
  stageLabel: string;
  updated: string;
  note: string;
  concepts: string[];
}
export function CphTable({ rows }: { rows: CphRow[] }) {
  const [expanded, setExpanded] = useState<string[]>([]);
  const toggle = (id: string) =>
    setExpanded((c) => (c.includes(id) ? c.filter((r) => r !== id) : [...c, id]));
  return (
    <div className="cph-table-wrap">
      <table className="cph-table">
        <thead>
          <tr>
            <th aria-label="Expand" />
            <th>Inquiry</th>
            <th>Researcher</th>
            <th>Sources</th>
            <th>Stage</th>
            <th>Updated</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const open = expanded.includes(row.id);
            return (
              <>
                <tr key={row.id} className={open ? "cph-row--expanded" : ""}>
                  <td>
                    <Button
                      aria-expanded={open}
                      aria-label={`${open ? "Collapse" : "Expand"} ${row.inquiry}`}
                      className="cph-row-toggle"
                      onPress={() => toggle(row.id)}
                    >
                      ›
                    </Button>
                  </td>
                  <td>
                    <strong>{row.inquiry}</strong>
                    <span className="cph-mono">{row.id}</span>
                  </td>
                  <td>{row.owner}</td>
                  <td>{row.sources}</td>
                  <td>{row.stageLabel}</td>
                  <td>{row.updated}</td>
                </tr>
                {open && (
                  <tr className="cph-detail-row">
                    <td />
                    <td colSpan={5}>
                      <p>{row.note}</p>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
