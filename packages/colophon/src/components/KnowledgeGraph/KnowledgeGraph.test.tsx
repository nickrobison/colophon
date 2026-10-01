import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CphKnowledgeGraph, type CphGraphNode } from "./KnowledgeGraph";
const node: CphGraphNode = {
  id: "n1",
  cx: 100,
  cy: 100,
  r: 7,
  label: "EMPIRICISM",
  lx: 115,
  ly: 100,
  ta: "start",
};
const primary: CphGraphNode = {
  id: "n2",
  cx: 200,
  cy: 120,
  r: 13,
  label: "ENLIGHTENMENT",
  lx: 200,
  ly: 100,
  ta: "middle",
  primary: true,
};
describe("CphKnowledgeGraph", () => {
  it("labels every node and exposes keyboard focus", () => {
    render(
      <CphKnowledgeGraph nodes={[node]} edges={["M100 100 200 200"]} label="Knowledge graph" />,
    );
    expect(screen.getByRole("img", { name: "EMPIRICISM" })).toHaveAttribute("tabindex", "0");
  });
  it("marks highlighted cluster in label", () => {
    render(<CphKnowledgeGraph nodes={[primary]} edges={[]} label="g" />);
    expect(screen.getByRole("img", { name: /highlighted cluster/ })).toBeVisible();
  });
});
