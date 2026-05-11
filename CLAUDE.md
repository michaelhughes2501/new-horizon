# CLAUDE.md

Guidance for Claude Code (and other agentic coders) when working in this repo.

## What this is

The **New Horizon** mobile companion: an Expo (React Native) project that
talks to the same Supabase backend as the `newhorizonweb` web app. The
current `NewHorizon/App.tsx` is the unmodified Expo template — most
feature work still lives in the web repo. Treat this tree as a clean
starting point for the mobile build-out.

## Stack

- Expo SDK 54 (`expo`), React Native 0.81, React 19
- TypeScript (strict mode, `extends "expo/tsconfig.base"`)
- Navigation: `@react-navigation/native` + `@react-navigation/bottom-tabs`
  (installed; not yet wired up)
- Supabase JS client + `expo-secure-store` for token storage
- Push: `expo-notifications` + `expo-device`
- New Architecture (`newArchEnabled: true`) and edge-to-edge enabled on
  Android

## Commands

```bash
cd NewHorizon
npm install
npm start          # expo start (Metro + dev menu)
npm run android    # expo run:android — requires Android SDK
npm run ios        # expo run:ios — requires Xcode (macOS)
npm run web        # expo start --web — fastest way to smoke-test changes
```

There is no lint script. `tsc` runs through Expo's bundler; treat the
strict-mode flag in `tsconfig.json` as the typecheck baseline.

## Where things live

- `NewHorizon/index.ts` — `registerRootComponent(App)` entry.
- `NewHorizon/App.tsx` — root component. Currently the default Expo
  scaffold; replace it with the navigator when feature work begins.
- `NewHorizon/app.json` — Expo config (icons, splash, `expo-secure-store`
  plugin, Android package `com.anonymous.NewHorizon`).
- `NewHorizon/assets/` — icon, splash, adaptive icon, favicon.
- `NewHorizon/package.json` — pinned to the SDK 54 dependency matrix;
  prefer `npx expo install <pkg>` over plain `npm install <pkg>` so new
  deps match the SDK.

## Conventions to follow

- Use `expo-secure-store` (not `AsyncStorage`) for the Supabase session
  token; mirror the web app's `AuthService` shape when you port it over.
- Hit the same Supabase project as `newhorizonweb`. Service identifiers
  (table names, RPCs like `increment_post_likes`) must match the schema
  in `newhorizonweb/new-horizon-web/supabase/database-schema.sql`.
- The Supabase JS client needs `react-native-url-polyfill/auto`
  imported once at app startup — the package is already in
  `dependencies`; remember to import it in `App.tsx` when you add
  Supabase usage.
- Keep navigation declarative under `@react-navigation/native`; don't
  introduce a second navigation library.
- Run `npm run web` before opening a native simulator — it's the fastest
  feedback loop and catches the same JS bugs.
