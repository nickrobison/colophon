import { useEffect, useMemo, useState, type ReactNode } from "react";

import { DensityContext, ThemeContext, type CphDensity, type CphTheme } from "./cphContext";

export interface CphProviderProps {
  children: ReactNode;
  defaultTheme?: CphTheme;
  defaultDensity?: CphDensity;
}

/**
 * Colophon root provider — applies data-theme / data-density to a wrapper div.
 * Pure react-aria compatible, no Radix dependency.
 */
export function CphProvider({
  children,
  defaultTheme = "light",
  defaultDensity = "comfortable",
}: CphProviderProps) {
  const [theme, setTheme] = useState<CphTheme>(defaultTheme);
  const [density, setDensity] = useState<CphDensity>(defaultDensity);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const themeValue = useMemo(() => ({ theme, setTheme }), [theme]);
  const densityValue = useMemo(() => ({ density, setDensity }), [density]);

  return (
    <ThemeContext.Provider value={themeValue}>
      <DensityContext.Provider value={densityValue}>
        <div className="cph-root" data-density={density} data-theme={theme}>
          {children}
        </div>
      </DensityContext.Provider>
    </ThemeContext.Provider>
  );
}
