import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CphBadge } from "./Badge";
describe("CphBadge", () => {
  it("renders neutral by default", () => { render(<CphBadge>Alpha</CphBadge>); expect(screen.getByText("Alpha")).toHaveClass("cph-badge--neutral"); });
  it("renders error tone with red role", () => { render(<CphBadge tone="error">3 urgent</CphBadge>); expect(screen.getByText("3 urgent")).toHaveClass("cph-badge--error"); });
});
