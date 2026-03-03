// src/settings/config/settings.config.ts

import { SettingsPreset, SettingsState } from "../types/settings.types";

export const DEFAULT_SETTINGS: SettingsState = {
  theme: "light",
  fontSize: "md",
  primaryColor: "#6366f1",
  navigation: "compact",
  fullscreen: false,
  contrast: false,
  rtl: false,
  colorMode: "integrate",
};

export const SETTINGS_PRESETS: SettingsPreset[] = [
  {
    id: "light-default",
    label: "Light Default",
    values: {
      theme: "light",
      fontSize: "md",
      primaryColor: "#6366f1",
    },
  },
  {
    id: "dark-pro",
    label: "Dark Pro",
    values: {
      theme: "dark",
      fontSize: "lg",
      primaryColor: "#8b5cf6",
    },
  },
];
