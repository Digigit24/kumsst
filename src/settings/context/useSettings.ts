// settings/context/useSettings.ts

import { useContext } from "react";
import { SettingsContext } from "./SettingsProvider";

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used inside SettingsProvider");
  }
  return ctx;
};
