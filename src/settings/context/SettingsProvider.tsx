import React, { createContext, useCallback, useContext, useReducer, useEffect, useMemo, useState } from "react";
import {
  SettingsContextType,
  SettingsState,
} from "../types/settings.types";
import { DEFAULT_SETTINGS } from "../config/settings.config";
import { useApplySettings } from "./useApplySettings";

const STORAGE_KEY = "app_settings_v1";

type Action =
  | { type: "INIT"; payload: SettingsState }
  | { type: "UPDATE"; key: keyof SettingsState; value: any }
  | { type: "APPLY_PRESET"; values: Partial<SettingsState> }
  | { type: "RESET" };

export const SettingsContext =
  createContext<SettingsContextType | null>(null);

function reducer(state: SettingsState, action: Action): SettingsState {
  switch (action.type) {
    case "INIT":
      return action.payload;

    case "UPDATE":
      return { ...state, [action.key]: action.value };

    case "APPLY_PRESET":
      return { ...state, ...action.values };

    case "RESET":
      return DEFAULT_SETTINGS;

    default:
      return state;
  }
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, dispatch] = useReducer(reducer, DEFAULT_SETTINGS);
  const [isInitialized, setIsInitialized] = useState(false);

  // 👉 APPLY DOM EFFECTS
  useApplySettings(settings);

  // 👉 LOAD FROM STORAGE (ONCE)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        dispatch({ type: "INIT", payload: JSON.parse(raw) });
      }
    } catch {
      // corrupted storage → ignore
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // 👉 SAVE TO STORAGE (only after initialization)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings, isInitialized]);

  const updateSetting = useCallback((key: keyof SettingsState, value: any) => {
    dispatch({ type: "UPDATE", key, value });
  }, []);

  const applyPreset = useCallback((preset: any) => {
    dispatch({ type: "APPLY_PRESET", values: preset.values });
  }, []);

  const resetSettings = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: "RESET" });
  }, []);

  const value = useMemo(() => ({
    settings, updateSetting, applyPreset, resetSettings,
  }), [settings, updateSetting, applyPreset, resetSettings]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
