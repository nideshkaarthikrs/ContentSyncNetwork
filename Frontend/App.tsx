import "react-native-gesture-handler";

import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
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
