import "react-native-gesture-handler";

import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { queryClient } from "./src/api/queryClient";
import Toast from "./src/components/common/Toast";
import TuneAudioPlayer from "./src/components/common/TuneAudioPlayer";
import AppNavigator from "./src/navigation/AppNavigator";
import { useAuthStore } from "./src/store/authStore";
import { usePreferencesStore } from "./src/store/preferencesStore";

export default function App() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const hydratePreferences = usePreferencesStore((state) => state.hydrate);
  const darkMode = usePreferencesStore((state) => state.darkMode);

  useEffect(() => {
    hydrate();
    hydratePreferences();
  }, [hydrate, hydratePreferences]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer theme={darkMode ? DarkTheme : DefaultTheme}>
          <StatusBar
            barStyle={darkMode ? "light-content" : "dark-content"}
            backgroundColor={darkMode ? DarkTheme.colors.card : DefaultTheme.colors.card}
          />
          <AppNavigator />
          <Toast />
          <TuneAudioPlayer />
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
