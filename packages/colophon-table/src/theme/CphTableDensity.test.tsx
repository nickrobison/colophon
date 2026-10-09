import { render, screen } from "@testing-library/react";

import {
  CphTableDensityProvider,
  resolveCphTableDensity,
  useCphTableDensity,
} from "./CphTableDensity";

function DensityProbe() {
  return <span data-testid="density-probe">{useCphTableDensity()}</span>;
}

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

describe("CphTableDensityProvider", () => {
  it("defaults to compact without an explicit density", () => {
    render(
      <CphTableDensityProvider>
        <DensityProbe />
      </CphTableDensityProvider>,
    );
    expect(screen.getByTestId("density-probe")).toHaveTextContent("compact");
  });

  it("provides an explicit density", () => {
    render(
      <CphTableDensityProvider density="dense">
        <DensityProbe />
      </CphTableDensityProvider>,
    );
    expect(screen.getByTestId("density-probe")).toHaveTextContent("dense");
  });

  it("nested providers inherit from the nearest table provider", () => {
    render(
      <CphTableDensityProvider density="dense">
        <CphTableDensityProvider>
          <DensityProbe />
        </CphTableDensityProvider>
      </CphTableDensityProvider>,
    );
    expect(screen.getByTestId("density-probe")).toHaveTextContent("dense");
  });
});
