import { createContext, useContext } from "react";

export type CphTheme = "light" | "dark";
export type CphDensity = "comfortable" | "compact" | "dense";

export const ThemeContext = createContext<{
  theme: CphTheme;
  setTheme: (theme: CphTheme) => void;
}>({
  theme: "light",
  setTheme: () => {},
});

export const DensityContext = createContext<{
  density: CphDensity;
  setDensity: (density: CphDensity) => void;
}>({
  density: "comfortable",
  setDensity: () => {},
});

export function useCphTheme() {
  return useContext(ThemeContext);
}

export function useCphDensity() {
  return useContext(DensityContext);
}
