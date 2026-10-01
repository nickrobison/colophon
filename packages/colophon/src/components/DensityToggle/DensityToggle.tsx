import { ToggleButton, ToggleButtonGroup } from "react-aria-components";

import { useCphDensity, useCphTheme, type CphDensity } from "../../theme/CphProvider";
import { CphIcon } from "../Icon/CphIcon";

const DENSITIES: { mode: CphDensity; label: string; aria: string }[] = [
  { mode: "comfortable", label: "R", aria: "Relaxed density" },
  { mode: "compact", label: "C", aria: "Compact density" },
  { mode: "dense", label: "D", aria: "Dense density" },
];

export function CphDensityToggle() {
  const { density, setDensity } = useCphDensity();
  return (
    <ToggleButtonGroup
      aria-label="Display density"
      className="cph-density"
      selectedKeys={[density]}
      selectionMode="single"
      onSelectionChange={(keys) => {
        const next = [...keys][0] as CphDensity | undefined;
        if (next) setDensity(next);
      }}
    >
      {DENSITIES.map(({ mode, label, aria }) => (
        <ToggleButton key={mode} id={mode} aria-label={aria} className="cph-density__btn">
          {label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

export function CphThemeToggle() {
  const { theme, setTheme } = useCphTheme();
  return (
    <ToggleButton
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className="cph-theme-toggle"
      isSelected={theme === "dark"}
      onChange={(selected) => setTheme(selected ? "dark" : "light")}
    >
      <CphIcon name={theme === "light" ? "moon" : "sun"} size={16} />
    </ToggleButton>
  );
}
