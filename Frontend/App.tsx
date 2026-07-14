import "react-native-gesture-handler";

import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { queryClient } from "./src/api/queryClient";
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
    <QueryClientProvider client={queryClient}>
      <NavigationContainer theme={darkMode ? DarkTheme : DefaultTheme}>
        <StatusBar style={darkMode ? "light" : "dark"} />
        <AppNavigator />
      </NavigationContainer>
    </QueryClientProvider>
  );
}

// npm install -g eas-cli
// npx eas-cli --version
// npx eas-cli login
// npx eas-cli init

// Build APK
// npx eas build -p android --profile preview

// Build AAB (Play Store):
// npx eas build -p android --profile production

// npx expo start -c

// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import AppNavigator from './src/navigation/AppNavigator';

// export default function App() {
//   return (
//     <NavigationContainer>
//       <AppNavigator />
//     </NavigationContainer>
//   );
// }
