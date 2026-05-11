# CLAUDE.md

Guidance for Claude Code (and humans) when working in this repository.

## Project overview

**new-horizon** is an **Expo / React Native** mobile app, with a web target via `expo start --web`. Backend services are provided by **Supabase** (`@supabase/supabase-js`). Push notifications use `expo-notifications`; secure key storage uses `expo-secure-store`.

The app lives under [`NewHorizon/`](./NewHorizon). **Open the repository root in VS Code** so the workspace settings, extension recommendations, and launch configs (which point into `NewHorizon/`) are loaded.

## Tech stack

The authoritative versions live in `NewHorizon/package.json` — check there if anything below drifts. At the time of writing the pins were:

- Expo SDK (`expo: ~54.0.33`) + React Native (`react-native: 0.81.5`)
- React 19 + TypeScript ~5.9
- React Navigation (bottom tabs)
- Supabase JS client (`@supabase/supabase-js`)
- `expo-notifications`, `expo-secure-store`, `expo-device`, `expo-constants`

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

Only `EXPO_PUBLIC_*` vars are exposed to the JS bundle. The Supabase **service_role** key must never be referenced anywhere in the client — it bypasses Row-Level Security and belongs only on a trusted server.

## Repo layout

- `NewHorizon/App.tsx` — root component.
- `NewHorizon/index.ts` — Expo entry.
- `NewHorizon/assets/` — icons & images.
- `NewHorizon/app.json` — Expo config.

## Conventions

- Use `expo-secure-store` for tokens; never `AsyncStorage` for secrets.
- Use Supabase RLS policies; never trust client-side filters.
- Keep images optimized (`assets/`) and use **`expo-image`** for high-performance loading and caching (compatible with the New Architecture).

## VS Code

Open the repo root, install recommended extensions, then run `npm start` from the integrated terminal.
