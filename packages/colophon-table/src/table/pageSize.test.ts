/** @packageDocumentation Tests for page size utilities. */

import { describe, it, expect } from "vitest";

import {
  PAGE_SIZES,
  PageSize,
  DEFAULT_PAGE_SIZE,
  nextPageSize,
  getTotalPages,
  PAGE_SIZE_LABELS,
} from "./pageSize";

describe("pageSize.ts", () => {
  describe("PAGE_SIZES", () => {
    it("is a const tuple of [8, 12, 20]", () => {
      expect(PAGE_SIZES).toEqual([8, 12, 20]);
      expect(PAGE_SIZES.length).toBe(3);
    });

    it("is readonly (TypeScript enforces this at compile time)", () => {
      // This is a compile-time check only - the following line would cause a TS error:
      // PAGE_SIZES.push(25);
      // We verify the array hasn't been mutated at runtime
      expect(PAGE_SIZES).toEqual([8, 12, 20]);
    });
  });

  describe("PageSize type", () => {
    it("is a union of 8 | 12 | 20", () => {
      // This is a compile-time check; if it compiles, the type is correct
      const sizes: PageSize[] = [8, 12, 20];
      expect(sizes).toEqual([8, 12, 20]);
    });
  });

  describe("DEFAULT_PAGE_SIZE", () => {
    it("is 8", () => {
      expect(DEFAULT_PAGE_SIZE).toBe(8);
    });

    it("is a valid PageSize", () => {
      const size: PageSize = DEFAULT_PAGE_SIZE;
      expect(PAGE_SIZES.includes(size)).toBe(true);
    });
  });

  describe("nextPageSize", () => {
    it("cycles 8 → 12", () => {
      expect(nextPageSize(8)).toBe(12);
    });

    it("cycles 12 → 20", () => {
      expect(nextPageSize(12)).toBe(20);
    });

    it("cycles 20 → 8", () => {
      expect(nextPageSize(20)).toBe(8);
    });

    it("cycles correctly through multiple iterations", () => {
      let current: PageSize = 8;
      expect(nextPageSize(current)).toBe(12);
      current = nextPageSize(current);
      expect(nextPageSize(current)).toBe(20);
      current = nextPageSize(current);
      expect(nextPageSize(current)).toBe(8);
      current = nextPageSize(current);
      expect(nextPageSize(current)).toBe(12);
    });

    it("returns a valid PageSize (no non-null assertion in source)", () => {
      // This test verifies the function returns a valid PageSize
      // The source code uses `as PageSize` cast, not `!` non-null assertion
      const result = nextPageSize(8);
      expect(PAGE_SIZES.includes(result)).toBe(true);
    });
  });

  describe("getTotalPages", () => {
    it("returns 1 for 0 rows", () => {
      expect(getTotalPages(0, 8)).toBe(1);
      expect(getTotalPages(0, 12)).toBe(1);
      expect(getTotalPages(0, 20)).toBe(1);
    });

    it("returns 1 for row count <= page size", () => {
      expect(getTotalPages(5, 8)).toBe(1);
      expect(getTotalPages(8, 8)).toBe(1);
      expect(getTotalPages(10, 12)).toBe(1);
      expect(getTotalPages(20, 20)).toBe(1);
    });

    it("returns correct page count for exact multiples", () => {
      expect(getTotalPages(16, 8)).toBe(2);
      expect(getTotalPages(24, 12)).toBe(2);
      expect(getTotalPages(40, 20)).toBe(2);
    });

    it("returns correct page count for partial pages", () => {
      expect(getTotalPages(9, 8)).toBe(2);
      expect(getTotalPages(10, 8)).toBe(2);
      expect(getTotalPages(15, 8)).toBe(2);
      expect(getTotalPages(17, 8)).toBe(3);
      expect(getTotalPages(25, 12)).toBe(3);
      expect(getTotalPages(41, 20)).toBe(3);
    });

    it("works with filtered row counts (e.g., 10 filtered rows, page size 8)", () => {
      // This is the key scenario: 10 filtered rows, page size 8 = 2 pages
      expect(getTotalPages(10, 8)).toBe(2);
    });
  });

  describe("PAGE_SIZE_LABELS", () => {
    it("has a label for each PageSize", () => {
      expect(PAGE_SIZE_LABELS[8]).toBe("8 per page");
      expect(PAGE_SIZE_LABELS[12]).toBe("12 per page");
      expect(PAGE_SIZE_LABELS[20]).toBe("20 per page");
    });

    it("is a const record with all PageSize keys", () => {
      const keys = Object.keys(PAGE_SIZE_LABELS).map(Number);
      expect(keys.sort((a, b) => a - b)).toEqual([8, 12, 20]);
    });
  });
});