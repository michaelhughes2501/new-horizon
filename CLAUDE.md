# CLAUDE.md

Guidance for Claude Code (and other agentic coders) when working in this repo.

## What this is

The **New Horizon** mobile companion: an Expo (React Native) project that talks to the same Supabase backend as the `newhorizonweb` web app. The current `NewHorizon/App.tsx` wires a bottom-tab navigator (Home / Feed / Notifications / Profile) over placeholder screens — most feature work still lives in the web repo. Treat this tree as a clean starting point for the mobile build-out.

The app lives under [`NewHorizon/`](./NewHorizon). **Open the repository root in VS Code** so the workspace settings, extension recommendations, and launch configs (which all point into `NewHorizon/`) are loaded.

## Stack

The authoritative versions live in `NewHorizon/package.json` — check there if anything below drifts. At time of writing:

- Expo SDK 56 (`expo: ~56.0.3`), React Native `0.85.3`, React 19
- TypeScript `~6.0.3` (strict mode, `extends "expo/tsconfig.base"`)
- Navigation: `@react-navigation/native` + `@react-navigation/bottom-tabs` (v7.x)
- Supabase JS client (`@supabase/supabase-js ^2.106.1`) + `expo-secure-store` for token storage
- Push: `expo-notifications` + `expo-device`
- `react-native-url-polyfill` (required for the Supabase JS client)
- New Architecture (`newArchEnabled: true`) and edge-to-edge enabled on Android (`com.anonymous.NewHorizon`)

## Commands (run inside `NewHorizon/`)

```bash
cd NewHorizon
npm install
npm start          # expo start (Metro + dev menu)
npm run android    # expo run:android — requires Android SDK
npm run ios        # expo run:ios — requires Xcode (macOS)
npm run web        # expo start --web — fastest way to smoke-test changes
```

There is no lint script. `tsc` runs through Expo's bundler; treat the strict-mode flag in `tsconfig.json` as the typecheck baseline.

## Environment

Create `NewHorizon/.env` (or use `app.config` extras) with:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

Only `EXPO_PUBLIC_*` vars are exposed to the JS bundle. The Supabase **service_role** key must never be referenced anywhere in the client — it bypasses Row-Level Security and belongs only on a trusted server.

## Where things live

- `NewHorizon/index.ts` — Expo entry. Imports `react-native-url-polyfill/auto` **first**, then `registerRootComponent(App)`.
- `NewHorizon/App.tsx` — root component. Wraps `GestureHandlerRootView` → `SafeAreaProvider` → `NavigationContainer` with a bottom tab navigator (Home / Feed / Notifications / Profile). Replace screen placeholders as features land.
- `NewHorizon/lib/supabase.ts` — Supabase client. Uses a custom `ExpoSecureStoreAdapter` (wrapping `expo-secure-store`) for auth token persistence + auto-refresh.
- `NewHorizon/app.json` — Expo config (icons, splash, `expo-secure-store` plugin, Android package `com.anonymous.NewHorizon`, edge-to-edge).
- `NewHorizon/assets/` — icon, splash, adaptive icon, favicon.
- `NewHorizon/package.json` — pinned to the SDK 56 dependency matrix; prefer `npx expo install <pkg>` over plain `npm install <pkg>` so new deps match the SDK.

## Conventions to follow

- **Secure storage**: use `expo-secure-store` for the Supabase session token (already wired in `lib/supabase.ts`); never `AsyncStorage` for secrets.
- **RLS-first data access**: hit the same Supabase project as `newhorizonweb`. Service identifiers (table names, RPCs like `increment_post_likes`) must match the schema in `newhorizonweb/new-horizon-web/supabase/database-schema.sql`. Never trust client-side filters — assume RLS will be the only enforcement.
- **Polyfill order**: keep `import 'react-native-url-polyfill/auto'` at the **top of `index.ts`**, before `App` or any transitive Supabase imports are evaluated.
- **Single navigation library**: keep navigation declarative under `@react-navigation/native`; don't introduce a second router.
- **Performance**: prefer `expo-image` over `<Image />` for cached / progressive image loading (compatible with the New Architecture). Install it first with `npx expo install expo-image` — it isn't in `package.json` yet.
- **Web smoke test**: run `npm run web` before opening a native simulator — same JS code path, much faster feedback loop.
- **SDK installs**: `npx expo install <pkg>` (not `npm install`) so version pins stay aligned with SDK 56.

## CI

Inside `.github/`:

- `workflows/codeql.yml` — CodeQL Advanced (JavaScript/TypeScript, build-mode `none`) on push/PR to `main`, plus a weekly Sunday schedule.
- `workflows/codacy.yml` — Codacy security analysis + SARIF upload on push/PR + weekly.
- `dependabot.yml` — weekly npm updates inside `/NewHorizon` (grouped: `expo`, `react-native`, `react-navigation`) and weekly GitHub Actions updates.

## VS Code

Open the repo root. Install recommended extensions (ESLint, Prettier, Expo Tools, React Native Tools, Pretty TS Errors, GitLens). The two launch configs are **"Expo: start"** (`npm start` in `NewHorizon/`) and **"Expo: web"** (`npm run web`).
