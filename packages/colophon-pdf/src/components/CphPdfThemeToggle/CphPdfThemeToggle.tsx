import { CphButton, CphIcon } from "@nickrobison/colophon";

import { useCphPdfViewerPrefs } from "../../pdf/viewerPrefsContext";

export interface CphPdfThemeToggleProps {
  className?: string;
}

/**
 * Light/dark toggle. Flips the viewer shell's `data-theme` (which colophon's
 * tokens respond to) and labels itself with the theme it will switch to —
 * "Use dark theme" in light mode, "Use light theme" in dark mode.
 */
export function CphPdfThemeToggle({ className }: CphPdfThemeToggleProps) {
  const { theme, toggleTheme } = useCphPdfViewerPrefs();
  const next = theme === "light" ? "dark" : "light";

  return (
    <CphButton
      variant="nav"
      className={["cph-pdf-theme-toggle", className].filter(Boolean).join(" ")}
      onPress={toggleTheme}
      aria-label={`Use ${next} theme`}
    >
      <CphIcon name={theme === "light" ? "moon" : "sun"} />
    </CphButton>
  );
}
