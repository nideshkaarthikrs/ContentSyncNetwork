import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

const DARK_MODE_KEY = "csn.darkMode";

interface PreferencesState {
  darkMode: boolean;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  setDarkMode: (value: boolean) => Promise<void>;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  darkMode: false,
  isHydrated: false,

  hydrate: async () => {
    try {
      const stored = await SecureStore.getItemAsync(DARK_MODE_KEY);
      set({ darkMode: stored === "true", isHydrated: true });
    } catch {
      set({ darkMode: false, isHydrated: true });
    }
  },

  setDarkMode: async (value: boolean) => {
    set({ darkMode: value });
    await SecureStore.setItemAsync(DARK_MODE_KEY, String(value));
  },
}));
