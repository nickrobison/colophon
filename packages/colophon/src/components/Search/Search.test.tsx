import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CphSearch } from "./Search";
describe("CphSearch", () => {
  it("renders placeholder and shortcut hint", () => {
    render(<CphSearch onSubmit={vi.fn()} />);
    expect(screen.getByPlaceholderText("Search concepts, sources, people…")).toBeVisible();
    expect(screen.getByRole("button", { name: "Search shortcut" })).toBeVisible();
  });
});
