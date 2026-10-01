import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell } from "./AppShell";
describe("AppShell", () => { it("renders shell with sidebar/main", () => { render(<AppShell sidebar={<span>nav</span>}><span>content</span></AppShell>); expect(screen.getByText("nav")).toBeVisible(); expect(screen.getByText("content")).toBeVisible(); }); });
