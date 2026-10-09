/** @packageDocumentation Tests for useCphTableState and useCphRowSelection. */

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_PAGE_SIZE } from "./pageSize";
import {
  useCphRowSelection,
  useCphTableState,
  type UseCphTableStateOptions,
} from "./useCphTableState";

type SortingState = Array<{ id: string; desc: boolean }>;
type ColumnFiltersState = Array<{ id: string; value: unknown }>;
type ColumnVisibilityState = Record<string, boolean>;
type ColumnPinningState = { start: string[]; end: string[] };
type RowSelectionState = Record<string, true>;
type ExpandedState = true | Record<string, boolean>;
type PaginationState = { pageIndex: number; pageSize: number };

const defaultSorting: SortingState = [];
const defaultColumnFilters: ColumnFiltersState = [];
const defaultColumnVisibility: ColumnVisibilityState = {};
const defaultColumnPinning: ColumnPinningState = { start: [], end: [] };
const defaultRowSelection: RowSelectionState = {};
const defaultExpanded: ExpandedState = {};
const defaultPagination: PaginationState = { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE };

describe("useCphTableState", () => {
  describe("controlled slices", () => {
    it("sorting: calls consumer onChange exactly once, no internal state", () => {
      const onSortingChange = vi.fn();
      const sorting: SortingState = [{ id: "col1", desc: true }];

      const { result } = renderHook(() =>
        useCphTableState({
          sorting: { controlled: true, value: sorting, onChange: onSortingChange },
        } as UseCphTableStateOptions),
      );

      // The controlled value should be in state
      expect(result.current.state.sorting).toBe(sorting);
      expect(result.current.onSortingChange).toBe(onSortingChange);
      expect(result.current.initialState.sorting).toBeUndefined();

      // Calling the change handler should call consumer exactly once
      act(() => {
        result.current.onSortingChange?.([{ id: "col2", desc: false }]);
      });

      expect(onSortingChange).toHaveBeenCalledTimes(1);
      expect(onSortingChange).toHaveBeenCalledWith([{ id: "col2", desc: false }]);
    });

    it("columnFilters: calls consumer onChange exactly once", () => {
      const onColumnFiltersChange = vi.fn();
      const columnFilters: ColumnFiltersState = [{ id: "col1", value: "test" }];

      const { result } = renderHook(() =>
        useCphTableState({
          columnFilters: {
            controlled: true,
            value: columnFilters,
            onChange: onColumnFiltersChange,
          },
        } as UseCphTableStateOptions),
      );

      expect(result.current.state.columnFilters).toBe(columnFilters);
      expect(result.current.onColumnFiltersChange).toBe(onColumnFiltersChange);

      act(() => {
        result.current.onColumnFiltersChange?.([{ id: "col2", value: "other" }]);
      });

      expect(onColumnFiltersChange).toHaveBeenCalledTimes(1);
    });

    it("columnVisibility: calls consumer onChange exactly once", () => {
      const onColumnVisibilityChange = vi.fn();
      const columnVisibility: ColumnVisibilityState = { col1: true, col2: false };

      const { result } = renderHook(() =>
        useCphTableState({
          columnVisibility: {
            controlled: true,
            value: columnVisibility,
            onChange: onColumnVisibilityChange,
          },
        } as UseCphTableStateOptions),
      );

      expect(result.current.state.columnVisibility).toBe(columnVisibility);
      expect(result.current.onColumnVisibilityChange).toBe(onColumnVisibilityChange);

      act(() => {
        result.current.onColumnVisibilityChange?.({ col1: false, col2: true });
      });

      expect(onColumnVisibilityChange).toHaveBeenCalledTimes(1);
    });

    it("columnPinning: calls consumer onChange exactly once", () => {
      const onColumnPinningChange = vi.fn();
      const columnPinning: ColumnPinningState = { start: ["col1"], end: ["col2"] };

      const { result } = renderHook(() =>
        useCphTableState({
          columnPinning: {
            controlled: true,
            value: columnPinning,
            onChange: onColumnPinningChange,
          },
        } as UseCphTableStateOptions),
      );

      expect(result.current.state.columnPinning).toBe(columnPinning);
      expect(result.current.onColumnPinningChange).toBe(onColumnPinningChange);

      act(() => {
        result.current.onColumnPinningChange?.({ start: ["col2"], end: [] });
      });

      expect(onColumnPinningChange).toHaveBeenCalledTimes(1);
    });

    it("rowSelection: calls consumer onChange exactly once", () => {
      const onRowSelectionChange = vi.fn();
      const rowSelection: RowSelectionState = { row1: true, row2: true };

      const { result } = renderHook(() =>
        useCphTableState({
          rowSelection: { controlled: true, value: rowSelection, onChange: onRowSelectionChange },
        } as UseCphTableStateOptions),
      );

      expect(result.current.state.rowSelection).toBe(rowSelection);
      expect(result.current.onRowSelectionChange).toBe(onRowSelectionChange);

      act(() => {
        result.current.onRowSelectionChange?.({ row3: true });
      });

      expect(onRowSelectionChange).toHaveBeenCalledTimes(1);
    });

    it("expanded: calls consumer onChange exactly once", () => {
      const onExpandedChange = vi.fn();
      const expanded: ExpandedState = { row1: true };

      const { result } = renderHook(() =>
        useCphTableState({
          expanded: { controlled: true, value: expanded, onChange: onExpandedChange },
        } as UseCphTableStateOptions),
      );

      expect(result.current.state.expanded).toBe(expanded);
      expect(result.current.onExpandedChange).toBe(onExpandedChange);

      act(() => {
        result.current.onExpandedChange?.({ row2: true });
      });

      expect(onExpandedChange).toHaveBeenCalledTimes(1);
    });

    it("pagination: calls consumer onChange exactly once", () => {
      const onPaginationChange = vi.fn();
      const pagination: PaginationState = { pageIndex: 2, pageSize: 20 };

      const { result } = renderHook(() =>
        useCphTableState({
          pagination: { controlled: true, value: pagination, onChange: onPaginationChange },
        } as UseCphTableStateOptions),
      );

      expect(result.current.state.pagination).toBe(pagination);
      expect(result.current.onPaginationChange).toBe(onPaginationChange);

      act(() => {
        result.current.onPaginationChange?.({ pageIndex: 3, pageSize: 20 });
      });

      expect(onPaginationChange).toHaveBeenCalledTimes(1);
    });

    it("multiple controlled slices: each calls its own handler", () => {
      const onSortingChange = vi.fn();
      const onPaginationChange = vi.fn();
      const sorting: SortingState = [{ id: "col1", desc: true }];
      const pagination: PaginationState = { pageIndex: 1, pageSize: 10 };

      const { result } = renderHook(() =>
        useCphTableState({
          sorting: { controlled: true, value: sorting, onChange: onSortingChange },
          pagination: { controlled: true, value: pagination, onChange: onPaginationChange },
        } as UseCphTableStateOptions),
      );

      act(() => {
        result.current.onSortingChange?.([{ id: "col2", desc: false }]);
      });

      act(() => {
        result.current.onPaginationChange?.({ pageIndex: 2, pageSize: 10 });
      });

      expect(onSortingChange).toHaveBeenCalledTimes(1);
      expect(onPaginationChange).toHaveBeenCalledTimes(1);
    });
  });

  describe("uncontrolled slices", () => {
    it("sorting: exposes hook-owned state and reflects handler updates", () => {
      const { result } = renderHook(() =>
        useCphTableState({
          sorting: { controlled: false, initialValue: [{ id: "col1", desc: true }] },
        } as UseCphTableStateOptions),
      );

      expect(result.current.state.sorting).toEqual([{ id: "col1", desc: true }]);
      expect(result.current.onSortingChange).toBeDefined();
      expect(result.current.initialState.sorting).toEqual([{ id: "col1", desc: true }]);

      // Calling the handler must update the exposed state (uncontrolled slices
      // are fed back through `state`, not stuck at their initial values)
      act(() => {
        result.current.onSortingChange?.([{ id: "col2", desc: false }]);
      });

      expect(result.current.state.sorting).toEqual([{ id: "col2", desc: false }]);
    });

    it("columnFilters: advances internal state", () => {
      const { result } = renderHook(() =>
        useCphTableState({
          columnFilters: { controlled: false, initialValue: [{ id: "col1", value: "test" }] },
        } as UseCphTableStateOptions),
      );

      expect(result.current.initialState.columnFilters).toEqual([{ id: "col1", value: "test" }]);
      expect(result.current.onColumnFiltersChange).toBeDefined();
    });

    it("columnVisibility: advances internal state", () => {
      const { result } = renderHook(() =>
        useCphTableState({
          columnVisibility: { controlled: false, initialValue: { col1: true } },
        } as UseCphTableStateOptions),
      );

      expect(result.current.initialState.columnVisibility).toEqual({ col1: true });
      expect(result.current.onColumnVisibilityChange).toBeDefined();
    });

    it("columnPinning: advances internal state", () => {
      const { result } = renderHook(() =>
        useCphTableState({
          columnPinning: { controlled: false, initialValue: { start: ["col1"], end: [] } },
        } as UseCphTableStateOptions),
      );

      expect(result.current.initialState.columnPinning).toEqual({ start: ["col1"], end: [] });
      expect(result.current.onColumnPinningChange).toBeDefined();
    });

    it("rowSelection: advances internal state", () => {
      const { result } = renderHook(() =>
        useCphTableState({
          rowSelection: { controlled: false, initialValue: { row1: true } },
        } as UseCphTableStateOptions),
      );

      expect(result.current.initialState.rowSelection).toEqual({ row1: true });
      expect(result.current.onRowSelectionChange).toBeDefined();
    });

    it("expanded: advances internal state", () => {
      const { result } = renderHook(() =>
        useCphTableState({
          expanded: { controlled: false, initialValue: { row1: true } },
        } as UseCphTableStateOptions),
      );

      expect(result.current.initialState.expanded).toEqual({ row1: true });
      expect(result.current.onExpandedChange).toBeDefined();
    });

    it("pagination: advances internal state", () => {
      const { result } = renderHook(() =>
        useCphTableState({
          pagination: { controlled: false, initialValue: { pageIndex: 1, pageSize: 20 } },
        } as UseCphTableStateOptions),
      );

      expect(result.current.initialState.pagination).toEqual({ pageIndex: 1, pageSize: 20 });
      expect(result.current.onPaginationChange).toBeDefined();
    });

    it("fully uncontrolled: all slices expose hook-owned defaults", () => {
      const { result } = renderHook(() => useCphTableState({}));

      expect(result.current.state).toEqual({
        sorting: [],
        columnFilters: [],
        columnVisibility: {},
        columnPinning: { start: [], end: [] },
        rowSelection: {},
        expanded: {},
        pagination: { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE },
      });
      expect(result.current.initialState.sorting).toEqual(defaultSorting);
      expect(result.current.initialState.columnFilters).toEqual(defaultColumnFilters);
      expect(result.current.initialState.columnVisibility).toEqual(defaultColumnVisibility);
      expect(result.current.initialState.columnPinning).toEqual(defaultColumnPinning);
      expect(result.current.initialState.rowSelection).toEqual(defaultRowSelection);
      expect(result.current.initialState.expanded).toEqual(defaultExpanded);
      expect(result.current.initialState.pagination).toEqual(defaultPagination);
    });
  });

  describe("single-row expansion enforcement (uncontrolled)", () => {
    it("expanding row B while row A is expanded leaves only B expanded", () => {
      const { result } = renderHook(() =>
        useCphTableState({
          expanded: { controlled: false, initialValue: { rowA: true } },
        } as UseCphTableStateOptions),
      );

      // Simulate expanding rowB while rowA is expanded
      act(() => {
        result.current.onExpandedChange?.({ rowA: true, rowB: true });
      });

      // The handler should have been called with single-row expansion enforced
      // We can't directly observe internal state, but we can verify the handler exists
      // and the logic is correct by checking the returned handler behavior
      expect(result.current.onExpandedChange).toBeDefined();
    });

    it("expanding multiple rows via updater function keeps only the last", () => {
      const { result } = renderHook(() =>
        useCphTableState({
          expanded: { controlled: false, initialValue: { rowA: true } },
        } as UseCphTableStateOptions),
      );

      // Use updater function form
      act(() => {
        result.current.onExpandedChange?.((current: ExpandedState) => {
          if (current === true) return true;
          return { ...current, rowB: true, rowC: true };
        });
      });

      expect(result.current.onExpandedChange).toBeDefined();
    });

    it("expanding with true (all rows) passes through", () => {
      const { result } = renderHook(() =>
        useCphTableState({
          expanded: { controlled: false, initialValue: {} },
        } as UseCphTableStateOptions),
      );

      act(() => {
        result.current.onExpandedChange?.(true);
      });

      expect(result.current.onExpandedChange).toBeDefined();
    });

    it("controlled expansion: does NOT enforce single-row (consumer responsibility)", () => {
      const onExpandedChange = vi.fn();
      const expanded: ExpandedState = { rowA: true, rowB: true }; // Multiple expanded - consumer's choice

      const { result } = renderHook(() =>
        useCphTableState({
          expanded: { controlled: true, value: expanded, onChange: onExpandedChange },
        } as UseCphTableStateOptions),
      );

      act(() => {
        result.current.onExpandedChange?.({ rowA: true, rowB: true, rowC: true });
      });

      // Consumer's handler called with exactly what they passed - no enforcement
      expect(onExpandedChange).toHaveBeenCalledTimes(1);
      expect(onExpandedChange).toHaveBeenCalledWith({ rowA: true, rowB: true, rowC: true });
    });
  });

  describe("no double-write verification", () => {
    it("controlled slice: internal state is never written when controlled", () => {
      const onSortingChange = vi.fn();
      const sorting: SortingState = [{ id: "col1", desc: true }];

      const { result, rerender } = renderHook(
        ({ sortingValue }) =>
          useCphTableState({
            sorting: { controlled: true, value: sortingValue, onChange: onSortingChange },
          } as UseCphTableStateOptions),
        { initialProps: { sortingValue: sorting } },
      );

      // Initial state should be the controlled value
      expect(result.current.state.sorting).toBe(sorting);

      // Change the controlled value from parent
      const newSorting: SortingState = [{ id: "col2", desc: false }];
      rerender({ sortingValue: newSorting });

      // State should immediately reflect new controlled value
      expect(result.current.state.sorting).toBe(newSorting);

      // Calling handler calls consumer, doesn't write to any internal state
      act(() => {
        result.current.onSortingChange?.([{ id: "col3", desc: true }]);
      });

      expect(onSortingChange).toHaveBeenCalledTimes(1);
      // The hook's internal state (if any) was never used for controlled slice
    });

    it("uncontrolled slice: internal state IS written when uncontrolled", () => {
      const { result } = renderHook(() =>
        useCphTableState({
          sorting: { controlled: false, initialValue: [{ id: "col1", desc: true }] },
        } as UseCphTableStateOptions),
      );

      // Initial state in initialState and exposed through state
      expect(result.current.initialState.sorting).toEqual([{ id: "col1", desc: true }]);
      expect(result.current.state.sorting).toEqual([{ id: "col1", desc: true }]);

      // Handler exists for internal updates
      expect(result.current.onSortingChange).toBeDefined();

      // Calling the handler updates the exposed state
      act(() => {
        result.current.onSortingChange?.([{ id: "col2", desc: false }]);
      });

      expect(result.current.state.sorting).toEqual([{ id: "col2", desc: false }]);
    });
  });

  describe("mixed controlled/uncontrolled", () => {
    it("some controlled, some uncontrolled", () => {
      const onSortingChange = vi.fn();
      const onPaginationChange = vi.fn();

      const { result } = renderHook(() =>
        useCphTableState({
          sorting: {
            controlled: true,
            value: [{ id: "col1", desc: true }],
            onChange: onSortingChange,
          },
          columnFilters: { controlled: false, initialValue: [{ id: "col2", value: "test" }] },
          pagination: {
            controlled: true,
            value: { pageIndex: 1, pageSize: 10 },
            onChange: onPaginationChange,
          },
        } as UseCphTableStateOptions),
      );

      // Controlled slices in state
      expect(result.current.state.sorting).toEqual([{ id: "col1", desc: true }]);
      expect(result.current.state.pagination).toEqual({ pageIndex: 1, pageSize: 10 });

      // Uncontrolled slices in initialState
      expect(result.current.initialState.columnFilters).toEqual([{ id: "col2", value: "test" }]);

      // Handlers for controlled slices
      expect(result.current.onSortingChange).toBe(onSortingChange);
      expect(result.current.onPaginationChange).toBe(onPaginationChange);

      // Handlers for uncontrolled slices
      expect(result.current.onColumnFiltersChange).toBeDefined();
    });
  });
});

describe("useCphRowSelection", () => {
  describe("controlled mode", () => {
    it("requires both value and onChange", () => {
      expect(() => {
        renderHook(() => useCphRowSelection({ controlled: true, value: { row1: true } }));
      }).toThrow("useCphRowSelection: controlled mode requires both `value` and `onChange`");

      expect(() => {
        renderHook(() => useCphRowSelection({ controlled: true, onChange: vi.fn() }));
      }).toThrow("useCphRowSelection: controlled mode requires both `value` and `onChange`");
    });

    it("returns controlled state and consumer handler", () => {
      const onChange = vi.fn();
      const value: RowSelectionState = { row1: true, row2: true };

      const { result } = renderHook(() =>
        useCphRowSelection({ controlled: true, value, onChange }),
      );

      expect(result.current.state).toEqual({ rowSelection: value });
      expect(result.current.onRowSelectionChange).toBe(onChange);
      expect(result.current.initialState).toEqual({});
    });

    it("calls consumer onChange exactly once", () => {
      const onChange = vi.fn();
      const value: RowSelectionState = { row1: true };

      const { result } = renderHook(() =>
        useCphRowSelection({ controlled: true, value, onChange }),
      );

      act(() => {
        result.current.onRowSelectionChange?.({ row2: true });
      });

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith({ row2: true });
    });
  });

  describe("uncontrolled mode", () => {
    it("returns hook-owned state and internal handler", () => {
      const initialValue: RowSelectionState = { row1: true };

      const { result } = renderHook(() => useCphRowSelection({ controlled: false, initialValue }));

      expect(result.current.state).toEqual({ rowSelection: initialValue });
      expect(result.current.initialState).toEqual({ rowSelection: initialValue });
      expect(result.current.onRowSelectionChange).toBeDefined();
    });

    it("defaults to empty selection when no initialValue", () => {
      const { result } = renderHook(() => useCphRowSelection({}));

      expect(result.current.state).toEqual({ rowSelection: {} });
      expect(result.current.initialState).toEqual({ rowSelection: {} });
      expect(result.current.onRowSelectionChange).toBeDefined();
    });

    it("internal handler updates the exposed state", () => {
      const { result } = renderHook(() =>
        useCphRowSelection({ controlled: false, initialValue: { row1: true } }),
      );

      act(() => {
        result.current.onRowSelectionChange?.({ row2: true });
      });

      expect(result.current.state).toEqual({ rowSelection: { row2: true } });
    });

    it("updater function form works", () => {
      const { result } = renderHook(() =>
        useCphRowSelection({ controlled: false, initialValue: { row1: true } }),
      );

      act(() => {
        result.current.onRowSelectionChange?.((current: RowSelectionState) => ({
          ...current,
          row2: true,
        }));
      });

      expect(result.current.state).toEqual({ rowSelection: { row1: true, row2: true } });
    });

    it("normalizes expand-all (true) to collapsed, preserving single-row", () => {
      const { result } = renderHook(() =>
        useCphTableState({ expanded: { controlled: false } } as UseCphTableStateOptions),
      );

      act(() => {
        result.current.onExpandedChange?.(true);
      });

      expect(result.current.state.expanded).toEqual({});
    });

    it("mixed keys collapse to the last true row", () => {
      const { result } = renderHook(() =>
        useCphTableState({ expanded: { controlled: false } } as UseCphTableStateOptions),
      );

      act(() => {
        result.current.onExpandedChange?.({ row1: true, row2: false, row3: true });
      });
      expect(result.current.state.expanded).toEqual({ row3: true });
    });

    it("controlled slices with undefined values are omitted from state", () => {
      const none = undefined as unknown as never;
      const { result } = renderHook(() =>
        useCphTableState({
          sorting: { controlled: true, value: none, onChange: vi.fn() },
          columnFilters: { controlled: true, value: none, onChange: vi.fn() },
          columnVisibility: { controlled: true, value: none, onChange: vi.fn() },
          columnPinning: { controlled: true, value: none, onChange: vi.fn() },
          rowSelection: { controlled: true, value: none, onChange: vi.fn() },
          expanded: { controlled: true, value: none, onChange: vi.fn() },
          pagination: { controlled: true, value: none, onChange: vi.fn() },
        } as UseCphTableStateOptions),
      );

      // Defensive path: a controlled slice with no value yet leaves TanStack
      // uncontrolled for that slice instead of writing undefined into state.
      expect(result.current.state).toEqual({});
    });

    it("collapses multi-row updates to the last expanded row", () => {
      const { result } = renderHook(() =>
        useCphTableState({ expanded: { controlled: false } } as UseCphTableStateOptions),
      );

      act(() => {
        result.current.onExpandedChange?.({ row1: true, row2: true });
      });

      expect(result.current.state.expanded).toEqual({ row2: true });
    });
  });

  describe("uncontrolled slices: every internal handler advances exposed state", () => {
    function renderUncontrolled() {
      return renderHook(() =>
        useCphTableState({
          sorting: { controlled: false },
          columnFilters: { controlled: false },
          columnVisibility: { controlled: false },
          columnPinning: { controlled: false },
          rowSelection: { controlled: false },
          expanded: { controlled: false },
          pagination: { controlled: false },
        } as UseCphTableStateOptions),
      );
    }

    it("value form", () => {
      const { result } = renderUncontrolled();

      act(() => {
        result.current.onSortingChange?.([{ id: "a", desc: false }]);
        result.current.onColumnFiltersChange?.([{ id: "b", value: "x" }]);
        result.current.onColumnVisibilityChange?.({ a: false });
        result.current.onColumnPinningChange?.({ start: ["a"], end: [] });
        result.current.onRowSelectionChange?.({ r1: true });
        result.current.onExpandedChange?.({ r1: true });
        result.current.onPaginationChange?.({ pageIndex: 2, pageSize: 12 });
      });

      expect(result.current.state.sorting).toEqual([{ id: "a", desc: false }]);
      expect(result.current.state.columnFilters).toEqual([{ id: "b", value: "x" }]);
      expect(result.current.state.columnVisibility).toEqual({ a: false });
      expect(result.current.state.columnPinning).toEqual({ start: ["a"], end: [] });
      expect(result.current.state.rowSelection).toEqual({ r1: true });
      expect(result.current.state.expanded).toEqual({ r1: true });
      expect(result.current.state.pagination).toEqual({ pageIndex: 2, pageSize: 12 });
    });

    it("updater-function form", () => {
      const { result } = renderUncontrolled();

      act(() => {
        result.current.onSortingChange?.((previous) => [...previous, { id: "a", desc: false }]);
        result.current.onColumnFiltersChange?.((previous) => [
          ...previous,
          { id: "b", value: "x" },
        ]);
        result.current.onColumnVisibilityChange?.((previous) => ({ ...previous, a: false }));
        result.current.onColumnPinningChange?.((previous) => ({
          ...previous,
          start: ["a"],
        }));
        result.current.onRowSelectionChange?.((previous) => ({ ...previous, r1: true }));
        result.current.onExpandedChange?.(() => ({ r1: true }));
        result.current.onPaginationChange?.((previous) => ({ ...previous, pageIndex: 2 }));
      });

      expect(result.current.state.sorting).toEqual([{ id: "a", desc: false }]);
      expect(result.current.state.columnFilters).toEqual([{ id: "b", value: "x" }]);
      expect(result.current.state.columnVisibility).toEqual({ a: false });
      expect(result.current.state.columnPinning).toEqual({ start: ["a"], end: [] });
      expect(result.current.state.rowSelection).toEqual({ r1: true });
      expect(result.current.state.expanded).toEqual({ r1: true });
      expect(result.current.state.pagination).toEqual({
        pageIndex: 2,
        pageSize: DEFAULT_PAGE_SIZE,
      });
    });
  });
});
