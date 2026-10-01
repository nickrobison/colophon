// contrast guard: #fffdfa on #d85b2a (spec §5/§7)
import { describe, expect, it } from "vitest";
function channel(hex: string, i: number): number {
  const v = parseInt(hex.slice(i, i + 2), 16) / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}
function lum(hex: string): number {
  const c = hex.replace("#", "");
  return 0.2126 * channel(c, 0) + 0.7152 * channel(c, 2) + 0.0722 * channel(c, 4);
}
function contrast(a: string, b: string): number {
  const l1 = lum(a);
  const l2 = lum(b);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}
describe("insight contrast", () => {
  it("white on orange meets large-text contrast", () => {
    expect(contrast("#fffdfa", "#d85b2a")).toBeGreaterThanOrEqual(3.0);
  });
});
