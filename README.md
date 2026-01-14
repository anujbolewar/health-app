# FitQuest

FitQuest is an Expo React Native starter focused on navigation, maps, and quick fitness stats. The entry point is `App.js`, which wires up a stack navigator with bottom tabs for Home and Map.

## Features

- Navigation built with `@react-navigation/native`, stack, and bottom tabs
- Map screen powered by `react-native-maps` with location permissions via `expo-location`
- Home screen with gradient hero, quick stats, and a location check action
- Safe area handling and linear-gradient styling

## Project Structure

- `App.js` — navigation container with stack + bottom tabs
- `src/screens` — `HomeScreen`, `MapScreen`
- `src/components` — layout container and primary button
- `src/constants` — shared colors and gradients

## Getting Started

1. Install dependencies

   ```bash
   npm install
   ```

2. Run the app

   ```bash
   npx expo start
   ```

3. Choose a target from the Expo CLI prompt (Android emulator, iOS simulator, web, or Expo Go).

## Notes

- First launch will request foreground location permission for the map and Home screen location check.
- If you regenerate assets or icons, update references in `app.json`.
