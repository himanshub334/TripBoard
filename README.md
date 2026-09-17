# TripBoard — Offline-First React Native Travel App

A portfolio-grade cross-platform travel itinerary app demonstrating offline-first architecture, atomic state management, native location abstraction, and list-rendering performance techniques.

## Stack

React Native, Expo, TypeScript, Jotai, AsyncStorage, NetInfo, Expo Location, FlatList.

## Features

- Create and organize trips
- Local-first persistence with AsyncStorage
- Offline mutation queue
- Sync-on-reconnect worker boundary
- Online/offline status
- Device location behind one JS service interface
- Virtualized FlatList rendering
- Memoized trip/activity rows
- Accessible React Native controls

## Run

```bash
npm install
npx expo start
```

Then press `a` for Android, `i` for iOS on macOS, or scan the QR code with Expo Go.

Web:

```bash
npm run web
```

Typecheck:

```bash
npm run typecheck
```

## Native builds

For a native Android project:

```bash
npx expo prebuild
npx expo run:android
```

For iOS on macOS:

```bash
npx expo prebuild
npx expo run:ios
```

For store builds, configure real bundle/package identifiers and signing credentials.

## Architecture

```text
UI
 ↓
Jotai atoms
 ↓
AsyncStorage
 ↓
offline sync queue
 ↓
reconnect
 ↓
sync worker / API
```

The UI reads and writes local state immediately. The sync layer is intentionally isolated so a real API can later replace the demo queue flush without changing the presentation layer.

## Location abstraction

The UI only calls:

```ts
getCurrentLocation()
```

The implementation is in `src/services/location.ts`. It currently uses Expo Location, which bridges to native iOS/Android location APIs. The same interface can be backed by custom Swift/Kotlin NativeModules in a bare React Native build.

## Performance

The itinerary uses `FlatList`, bounded rendering settings, and `React.memo` for rows/cards. Use release builds and a lower-end Android device for real measurements.

Do not put a numeric performance improvement on a resume until you have measured it yourself.

## GitHub

```bash
git init
git add .
git commit -m "feat: build offline-first TripBoard app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/TripBoard.git
git push -u origin main
```
# TripBoard
