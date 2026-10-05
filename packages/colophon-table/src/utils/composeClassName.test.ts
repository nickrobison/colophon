import { composeClassName } from "./composeClassName";

describe("composeClassName", () => {
  it("returns base when incoming is undefined", () => {
    expect(composeClassName("base", undefined)).toBe("base");
  });

  it("concatenates base and string incoming", () => {
    expect(composeClassName("base", "extra")).toBe("base extra");
  });

  it("returns a function when incoming is a function", () => {
    const fn = () => "extra";
    const result = composeClassName("base", fn);
    expect(typeof result).toBe("function");
  });

  it("invoking the returned function returns a string starting with base", () => {
    const fn = () => "extra";
    const result = composeClassName("base", fn);
    const invoked = (result as (values: { defaultClassName: string | undefined }) => string)({
      defaultClassName: undefined,
    });
    expect(invoked).toMatch(/^base /);
  });
});
