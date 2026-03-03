// settings/types/settings.types.ts

export type ThemeMode = "light" | "dark" | "system";

export type FontSize = "sm" | "md" | "lg";
export type ColorMode = "integrate" | "apparent";
export type NavigationMode = "side" | "top" | "compact";

export interface SettingsState {
  theme: ThemeMode;
  fontSize: FontSize;
  primaryColor: string;
  navigation: NavigationMode;
  fullscreen: boolean;

  contrast: boolean;
  rtl: boolean;
  colorMode: ColorMode;
}

export interface SettingsPreset {
  id: string;
  label: string;
  values: Partial<SettingsState>;
}

export interface SettingsContextType {
  settings: SettingsState;
  updateSetting: <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) => void;
  applyPreset: (preset: SettingsPreset) => void;
  resetSettings: () => void;
}
