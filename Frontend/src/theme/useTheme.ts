import { usePreferencesStore } from "../store/preferencesStore";
import { darkTheme, lightTheme, Theme } from "./theme";

export function useTheme(): Theme {
  const darkMode = usePreferencesStore((state) => state.darkMode);
  return darkMode ? darkTheme : lightTheme;
}
