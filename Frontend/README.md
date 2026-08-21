# CSN mobile app

React Native (bare CLI, RN 0.81.5) app for Android and iOS. No Expo SDK, no EAS — `android/` and `ios/` are real native projects checked into this repo, and permissions/build config live directly in `AndroidManifest.xml` / `Info.plist` / `Podfile` / `build.gradle`.

## Prerequisites

- Node.js, npm
- Android Studio + Android SDK (for Android builds)
- Xcode + CocoaPods (for iOS builds; installed via Bundler, see below)

## Setup

```bash
npm install
cp .env.example .env   # then edit API_HOST — see below
cd ios && bundle install && bundle exec pod install && cd ..
```

## Running

```bash
npm run android   # builds and installs on a connected device/emulator
npm run ios        # builds and runs in the iOS simulator
npm start           # Metro bundler only
```

## Environment variables

`API_HOST` (in `.env`) must point at your dev machine's **LAN IP** + the backend gateway port (e.g. `http://192.168.1.41:8080`) — a physical phone can't resolve `localhost` to your dev machine. Find your LAN IP with `ipconfig getifaddr en0` (macOS) or `ipconfig` (Windows).

Env vars are read via [`react-native-config`](https://github.com/lugg/react-native-config), not Expo's `EXPO_PUBLIC_*` convention. **Changing `.env` requires a native rebuild** — a Metro restart alone will not pick up the new value:

- Android: re-run `npm run android` (occasionally `cd android && ./gradlew clean` first if it doesn't take)
- iOS: re-run `bundle exec pod install`, then `npm run ios`

## Permissions

There's no config-plugin layer (no `app.json` managed config). To add or change a permission, edit the native files directly:

- Android: `android/app/src/main/AndroidManifest.xml`
- iOS: `ios/CSN/Info.plist`

## Building for release

- **Android**: `cd android && ./gradlew assembleRelease` (APK) or `./gradlew bundleRelease` (AAB for Play Store).
- **iOS**: open `ios/CSN.xcworkspace` in Xcode and use Product → Archive.

There is no EAS Build step — this is a standard bare React Native release process.
