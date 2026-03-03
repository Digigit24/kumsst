import { useEffect } from "react";
import { SettingsState } from "../types/settings.types";
import { hexToHsl } from "../utils/color";
export const useApplySettings = (settings: SettingsState) => {
  useEffect(() => {
    const root = document.documentElement;

    /* ---------------- THEME ---------------- */
    if (settings.theme === "dark") {
      root.classList.add("dark");
    } else if (settings.theme === "light") {
      root.classList.remove("dark");
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      root.classList.toggle("dark", prefersDark);
    }

    /* ---------------- CONTRAST ---------------- */
    root.classList.toggle("eye-comfort", settings.contrast);

    /* ---------------- COLOR MODE ---------------- */
    if (settings.colorMode === "integrate") {
      root.style.setProperty("--primary-opacity", "0.85");
      root.style.setProperty("--primary-strength", "0.12");
    } else {
      root.style.setProperty("--primary-opacity", "1");
      root.style.setProperty("--primary-strength", "0.25");
    }

    /* ---------------- RTL ---------------- */
    root.setAttribute("dir", settings.rtl ? "rtl" : "ltr");

    /* ---------------- PRIMARY COLOR ---------------- */
    const hsl = hexToHsl(settings.primaryColor);
    root.style.setProperty("--primary", hsl);

    /* ---------------- FONT SIZE ---------------- */
    const sizeMap = {
      sm: "14px",
      md: "16px",
      lg: "18px",
    };
    root.style.fontSize = sizeMap[settings.fontSize];
  }, [settings]);
};
