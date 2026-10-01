import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type CphTheme = "light" | "dark";
export type CphDensity = "comfortable" | "compact" | "dense";

const ThemeCtx = createContext<{ theme: CphTheme; setTheme: (t: CphTheme) => void }>({
  theme: "light",
  setTheme: () => {},
});
const DensityCtx = createContext<{ density: CphDensity; setDensity: (d: CphDensity) => void }>({
  density: "comfortable",
  setDensity: () => {},
});

export function useCphTheme() {
  return useContext(ThemeCtx);
}
export function useCphDensity() {
  return useContext(DensityCtx);
}

export interface CphProviderProps {
  children: ReactNode;
  defaultTheme?: CphTheme;
  defaultDensity?: CphDensity;
}

/**
 * Colophon root provider — applies data-theme / data-density to a wrapper div.
 * Pure react-aria compatible, no Radix dependency.
 */
export function CphProvider({ children, defaultTheme = "light", defaultDensity = "comfortable" }: CphProviderProps) {
  const [theme, setTheme] = useState<CphTheme>(defaultTheme);
  const [density, setDensity] = useState<CphDensity>(defaultDensity);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  return (
    <ThemeCtx.Provider value={{ theme, setTheme }}>
      <DensityCtx.Provider value={{ density, setDensity }}>
        <div className="cph-root" data-density={density} data-theme={theme}>
          {children}
        </div>
      </DensityCtx.Provider>
    </ThemeCtx.Provider>
  );
}
