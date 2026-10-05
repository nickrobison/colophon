import { resolveCphTableDensity } from "./CphTableDensity";

describe("resolveCphTableDensity", () => {
  it("explicit density wins over context", () => {
    expect(resolveCphTableDensity("dense", "comfortable")).toBe("dense");
  });

  it("falls back to context density when explicit is undefined", () => {
    expect(resolveCphTableDensity(undefined, "comfortable")).toBe("comfortable");
  });

  it("falls back to compact spec default when both are undefined", () => {
    expect(resolveCphTableDensity(undefined, undefined)).toBe("compact");
  });
});
