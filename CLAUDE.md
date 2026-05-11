# CLAUDE.md

Guidance for Claude Code (and humans) when working in this repository.

## Project overview

**new-horizon** is an **Expo / React Native** mobile app, with a web target via `expo start --web`. Backend services are provided by **Supabase** (`@supabase/supabase-js`). Push notifications use `expo-notifications`; secure key storage uses `expo-secure-store`.

The app lives under [`NewHorizon/`](./NewHorizon). Open that subfolder (or the repo root) in VS Code.

## Tech stack

- Expo SDK 54 + React Native 0.81
- React 19 + TypeScript
- React Navigation (bottom tabs)
- Supabase JS client
- expo-notifications, expo-secure-store, expo-device

## Commands (run inside `NewHorizon/`)

```bash
cd NewHorizon
npm install
npm start          # expo start — dev menu w/ QR code
npm run android    # build & run Android
npm run ios        # build & run iOS (macOS only)
npm run web        # run in browser via Metro web
```

## Environment

Create `NewHorizon/.env` (or use `app.config` extras) with:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Only `EXPO_PUBLIC_*` vars are exposed to the JS bundle.

## Repo layout

- `NewHorizon/App.tsx` — root component.
- `NewHorizon/index.ts` — Expo entry.
- `NewHorizon/assets/` — icons & images.
- `NewHorizon/app.json` — Expo config.

## Conventions

- Use `expo-secure-store` for tokens; never `AsyncStorage` for secrets.
- Use Supabase RLS policies; never trust client-side filters.
- Keep images optimized (`assets/`) and lazy-load via `react-native-fast-image`-style patterns if needed.

## VS Code

Open the repo, install recommended extensions, then run `npm start` from the integrated terminal.
