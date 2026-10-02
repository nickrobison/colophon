import { describe, expect, it } from "vitest";

import { dateRange, email, maxLength, minLength, pastYear, range, required } from "./validators";

describe("required", () => {
  const isRequired = required();

  it("rejects empty string", () => {
    expect(isRequired("")).toBe("This field is required.");
  });

  it("rejects whitespace-only string", () => {
    expect(isRequired("   ")).toBe("This field is required.");
  });

  it("rejects undefined", () => {
    expect(isRequired(undefined)).toBe("This field is required.");
  });

  it("rejects null", () => {
    expect(isRequired(null)).toBe("This field is required.");
  });

  it("accepts a non-empty value", () => {
    expect(isRequired("x")).toBeUndefined();
  });

  it("accepts a custom message", () => {
    expect(required("Name needed.")("")).toBe("Name needed.");
  });
});

describe("email", () => {
  const isEmail = email();

  it("accepts name@institution.org", () => {
    expect(isEmail("name@institution.org")).toBeUndefined();
  });

  it("accepts a.b@c.co.uk", () => {
    expect(isEmail("a.b@c.co.uk")).toBeUndefined();
  });

  it("rejects plain (no @)", () => {
    expect(isEmail("plain")).toBe("Enter a valid email address.");
  });

  it("rejects no-at.com (no @)", () => {
    expect(isEmail("no-at.com")).toBe("Enter a valid email address.");
  });

  it("rejects no@domain (no dot in domain)", () => {
    expect(isEmail("no@domain")).toBe("Enter a valid email address.");
  });

  it("rejects has space@x.com (whitespace)", () => {
    expect(isEmail("has space@x.com")).toBe("Enter a valid email address.");
  });

  it("rejects @x.com (@ at start)", () => {
    expect(isEmail("@x.com")).toBe("Enter a valid email address.");
  });
});

describe("range", () => {
  const inRange = range(1400, 2025);

  it("accepts the lower bound (inclusive)", () => {
    expect(inRange(1400)).toBeUndefined();
  });

  it("accepts the upper bound (inclusive)", () => {
    expect(inRange(2025)).toBeUndefined();
  });

  it("rejects a value below the lower bound", () => {
    expect(inRange(1399)).toBe("Enter a value between 1400 and 2025.");
  });

  it("rejects a value above the upper bound", () => {
    expect(inRange(2026)).toBe("Enter a value between 1400 and 2025.");
  });

  it("rejects NaN", () => {
    expect(inRange(NaN)).toBe("Enter a value between 1400 and 2025.");
  });

  it("rejects Infinity", () => {
    expect(inRange(Infinity)).toBe("Enter a value between 1400 and 2025.");
  });

  it("accepts a custom message", () => {
    expect(range(1, 10, "Out of bounds.")(0)).toBe("Out of bounds.");
  });
});

describe("minLength", () => {
  const atLeast10 = minLength(10);

  it("rejects a 9-character string", () => {
    expect(atLeast10("123456789")).toBe("Enter at least 10 characters.");
  });

  it("accepts a 10-character string", () => {
    expect(atLeast10("1234567890")).toBeUndefined();
  });

  it("accepts an empty string", () => {
    expect(atLeast10("")).toBeUndefined();
  });
});

describe("maxLength", () => {
  const atMost5 = maxLength(5);

  it("rejects a 6-character string", () => {
    expect(atMost5("123456")).toBe("Enter at most 5 characters.");
  });

  it("accepts a 5-character string", () => {
    expect(atMost5("12345")).toBeUndefined();
  });
});

describe("dateRange", () => {
  const endsAfter = dateRange("2025-06-12");

  it("returns undefined when end equals start", () => {
    expect(endsAfter("2025-06-12")).toBeUndefined();
  });

  it("returns undefined when end is after start", () => {
    expect(endsAfter("2025-06-13")).toBeUndefined();
  });

  it("returns the message when end is before start", () => {
    expect(endsAfter("2025-06-10")).toBe(
      "Choose an end date that falls on or after the start date.",
    );
  });

  it("returns undefined when end is undefined", () => {
    expect(endsAfter(undefined)).toBeUndefined();
  });

  it("returns undefined when end is empty", () => {
    expect(endsAfter("")).toBeUndefined();
  });

  it("returns undefined when end is null", () => {
    expect(endsAfter(null)).toBeUndefined();
  });

  it("returns undefined when start is missing and end is filled", () => {
    expect(dateRange(null)("2025-06-12")).toBeUndefined();
  });
});

describe("pastYear", () => {
  const isPastYear = pastYear();

  it("accepts 2025", () => {
    expect(isPastYear("2025")).toBeUndefined();
  });

  it("accepts 1400", () => {
    expect(isPastYear("1400")).toBeUndefined();
  });

  it("rejects 2026", () => {
    expect(isPastYear("2026")).toBe("Enter a year between 1400 and 2025.");
  });

  it("rejects a 2-digit year", () => {
    expect(isPastYear("20")).toBe("Enter a year between 1400 and 2025.");
  });
});
