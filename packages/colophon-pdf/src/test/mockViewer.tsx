import { render, type RenderOptions } from "@testing-library/react";
import type { ReactNode } from "react";

import type { CphPdfViewerContextValue } from "../pdf/context";
import { MockPdfProvider } from "./MockPdfProvider";

export interface RenderWithPdfOptions extends Omit<RenderOptions, "wrapper"> {
  /** Context fields to override for the wrapped render. */
  value?: Partial<CphPdfViewerContextValue>;
}

/** `@testing-library/react` render wrapped in a mock PDF provider. */
export function renderWithPdf(ui: ReactNode, options: RenderWithPdfOptions = {}) {
  const { value, ...renderOptions } = options;
  return render(ui, {
    wrapper: ({ children }) => (
      <MockPdfProvider {...(value === undefined ? {} : { value })}>{children}</MockPdfProvider>
    ),
    ...renderOptions,
  });
}
