/** Shared 128-row generator for table stories. */

export interface TableRow {
  id: string;
  name: string;
  value: number;
  status: string;
  category: string;
}

export function generateRows(count: number = 128): TableRow[] {
  const statuses = ["Active", "Pending", "Complete", "Failed"];
  const categories = ["A", "B", "C", "D"];
  return Array.from({ length: count }, (_, i) => ({
    id: `row-${i + 1}`,
    name: `Item ${i + 1}`,
    value: Math.floor(Math.random() * 10000),
    status: statuses[i % statuses.length],
    category: categories[i % categories.length],
  }));
}
