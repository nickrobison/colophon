import type { RowData } from "@tanstack/react-table";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Cell } from "../components/TableRow/Cell";
import {
  createNumericCell,
  createSortHeader,
  createStatusCell,
  createTruncateCell,
} from "./cellRenderers";
import { cphColumnHelper, metaOf, type CphColumnMeta } from "./column";

// Test data type
type TestRow = RowData & {
  id: string;
  name: string;
  value: number;
  status: string;
  description: string;
};

describe("column.ts — types and helpers", () => {
  it("cphColumnHelper<TData>() produces defs typed against CphTableFeatures with no any", () => {
    const helper = cphColumnHelper<TestRow>();

    // These should all typecheck without any casts — the fact that this compiles
    // proves the types are correct. We don't assert on column properties because
    // the column array is a union of different column def types.
    const columns = [
      helper.accessor("id", {
        header: "ID",
        meta: { widthClass: "source" } satisfies CphColumnMeta,
      }),
      helper.accessor("name", {
        header: "Name",
        meta: {} satisfies CphColumnMeta,
      }),
      helper.accessor("value", {
        header: "Value",
        meta: { numeric: true, align: "right" } satisfies CphColumnMeta,
      }),
      helper.accessor("status", {
        header: "Status",
        meta: { statusTone: () => "sage" } satisfies CphColumnMeta,
      }),
      helper.display({
        id: "actions",
        header: "Actions",
        cell: () => "…",
      }),
    ];

    // Verify the array length at runtime
    expect(columns).toHaveLength(5);
  });

  it("metaOf() returns the meta object when present", () => {
    const helper = cphColumnHelper<TestRow>();
    const def = helper.accessor("value", {
      header: "Value",
      meta: { numeric: true, align: "right", aggregate: "sum" } satisfies CphColumnMeta,
    });

    const meta = metaOf(def);
    expect(meta).toEqual({ numeric: true, align: "right", aggregate: "sum" });
  });

  it("metaOf() returns {} for a def with no meta", () => {
    const helper = cphColumnHelper<TestRow>();
    const def = helper.accessor("name", { header: "Name" });

    const meta = metaOf(def);
    expect(meta).toEqual({});
  });

  it("metaOf() returns {} for a display def without meta", () => {
    const helper = cphColumnHelper<TestRow>();
    const def = helper.display({ id: "name", header: "Name" });

    const meta = metaOf(def);
    expect(meta).toEqual({});
  });

  it("CphColumnMeta fields respect exactOptionalPropertyTypes (no explicit undefined)", () => {
    // This test ensures the type allows optional fields without requiring explicit undefined
    const meta: CphColumnMeta = {
      numeric: true,
      // align, aggregate, format, widthClass, statusTone are all optional
    };
    expect(meta.numeric).toBe(true);
    expect(meta.align).toBeUndefined();
    expect(meta.aggregate).toBeUndefined();
  });
});

describe("cellRenderers.tsx — reusable cell renderers", () => {
  describe("createSortHeader", () => {
    it("returns a function that renders the label only (no button, no arrow)", () => {
      const renderer = createSortHeader("Name");
      const { container } = render(renderer());

      const label = container.querySelector(".cph-table__sort-label");
      expect(label).toBeInTheDocument();
      expect(label).toHaveTextContent("Name");

      // No button or arrow should be present
      expect(container.querySelector("button")).not.toBeInTheDocument();
      expect(container.querySelector(".cph-table__sort-arrow")).not.toBeInTheDocument();
    });
  });

  describe("createNumericCell", () => {
    it("formats numbers via toLocaleString by default", () => {
      const renderer = createNumericCell();
      const { container } = render(renderer(1234567.89));

      const wrapper = container.querySelector(".cph-table__numeric");
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveAttribute("data-cph-table", "numeric-cell");
      expect(wrapper).toHaveTextContent("1,234,567.89");
    });

    it("uses custom format function when provided", () => {
      const renderer = createNumericCell((v) => `$${Number(v).toFixed(2)}`);
      const { container } = render(renderer(42));

      const wrapper = container.querySelector(".cph-table__numeric");
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveTextContent("$42.00");
    });

    it("handles null/undefined values gracefully", () => {
      const renderer = createNumericCell();
      const { container } = render(renderer(null));

      const wrapper = container.querySelector(".cph-table__numeric");
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveTextContent("");
    });

    it("returns a block-level div so text-align: right takes effect", () => {
      const renderer = createNumericCell();
      const { container } = render(renderer(42));

      const wrapper = container.querySelector(".cph-table__numeric");
      expect(wrapper).toBeInTheDocument();
      expect(wrapper?.tagName.toLowerCase()).toBe("div");
    });
  });

  describe("createStatusCell", () => {
    it("renders CphStatusChip with the given tone", () => {
      const renderer = createStatusCell("sage");
      const { container } = render(renderer("Active"));

      const chip = container.querySelector(".cph-table__chip");
      expect(chip).toBeInTheDocument();
      expect(chip).toHaveClass("cph-badge--sage");
      expect(chip).toHaveTextContent("Active");
    });

    it("handles null/undefined values gracefully", () => {
      const renderer = createStatusCell("error");
      const { container } = render(renderer(null));

      const chip = container.querySelector(".cph-table__chip");
      expect(chip).toBeInTheDocument();
      expect(chip).toHaveTextContent("");
    });
  });

  describe("createTruncateCell", () => {
    it("renders text with cph-table__truncate class and title attribute", () => {
      const renderer = createTruncateCell();
      const { container } = render(renderer("Very long description that should be truncated"));

      const span = container.querySelector(".cph-table__truncate");
      expect(span).toBeInTheDocument();
      expect(span).toHaveAttribute("data-cph-table", "truncate-cell");
      expect(span).toHaveAttribute("title", "Very long description that should be truncated");
      expect(span).toHaveTextContent("Very long description that should be truncated");
    });

    it("handles null/undefined values gracefully", () => {
      const renderer = createTruncateCell();
      const { container } = render(renderer(null));

      const span = container.querySelector(".cph-table__truncate");
      expect(span).toBeInTheDocument();
      expect(span).toHaveAttribute("title", "");
      expect(span).toHaveTextContent("");
    });

    it("returns an inline span (truncation CSS works on inline-block container)", () => {
      const renderer = createTruncateCell();
      const { container } = render(renderer("text"));

      const span = container.querySelector(".cph-table__truncate");
      expect(span).toBeInTheDocument();
      expect(span?.tagName.toLowerCase()).toBe("span");
    });
  });
});

describe("Integration: numeric meta reaches rendered td class", () => {
  // This test simulates how the table body component would compose the renderer
  // with the Cell component, reading meta.numeric to apply the class to the <td>.
  it("numeric meta causes cph-table__numeric to be applied to the td via Cell", () => {
    const helper = cphColumnHelper<TestRow>();
    const def = helper.accessor("value", {
      header: "Value",
      cell: createNumericCell(),
      meta: { numeric: true } satisfies CphColumnMeta,
    });

    // Simulate the table body component logic:
    // 1. Read meta from column def
    const meta = metaOf(def);
    const tdClassName = meta.numeric ? "cph-table__numeric" : "";

    // 2. Get the cell value (in real usage this comes from row data)
    const value = 12345;

    // 3. Call the cell renderer (def.cell is the renderer function)
    const cellRenderer = def.cell as (value: unknown) => React.ReactElement;
    const cellContent = cellRenderer(value);

    // 4. Render via Cell component with the td className
    const { container } = render(
      <Cell className={tdClassName} data-cph-table="cell">
        {cellContent}
      </Cell>,
    );

    // The td should have the numeric class
    const td = container.querySelector("td.cph-table__numeric");
    expect(td).toBeInTheDocument();

    // The content wrapper should ALSO have the class (defense in depth)
    const contentWrapper = container.querySelector(
      ".cph-table__numeric[data-cph-table='numeric-cell']",
    );
    expect(contentWrapper).toBeInTheDocument();
    expect(contentWrapper).toHaveTextContent("12,345");
  });

  it("non-numeric meta does not apply cph-table__numeric to td", () => {
    const helper = cphColumnHelper<TestRow>();
    const def = helper.accessor("name", {
      header: "Name",
      cell: createTruncateCell(),
      meta: { numeric: false } satisfies CphColumnMeta,
    });

    const meta = metaOf(def);
    const tdClassName = meta.numeric ? "cph-table__numeric" : "";

    const value = "Some name";
    const cellRenderer = def.cell as (value: unknown) => React.ReactElement;
    const cellContent = cellRenderer(value);

    const { container } = render(
      <Cell className={tdClassName} data-cph-table="cell">
        {cellContent}
      </Cell>,
    );

    const td = container.querySelector("td");
    expect(td).toBeInTheDocument();
    expect(td).not.toHaveClass("cph-table__numeric");

    // The content should have truncate class instead
    const truncateSpan = container.querySelector(".cph-table__truncate");
    expect(truncateSpan).toBeInTheDocument();
  });
});
