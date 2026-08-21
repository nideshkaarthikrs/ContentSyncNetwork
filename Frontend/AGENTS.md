# Bare React Native, not Expo

This app was migrated off Expo (managed workflow, EAS) to bare React Native CLI. There is no `app.json` managed config, no config plugins, and no `expo-*` packages — native permissions and build config live directly in `android/app/src/main/AndroidManifest.xml`, `ios/CSN/Info.plist`, `ios/Podfile`, and `android/app/build.gradle`.

Do not reintroduce Expo packages or `expo start`/`expo run:*`/`eas build` commands. Use `npm run android` / `npm run ios` / `npm start` (plain React Native CLI), and see `Frontend/README.md` for setup.
