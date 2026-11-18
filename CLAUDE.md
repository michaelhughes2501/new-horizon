# CLAUDE.md

Guidance for Claude Code (and other agentic coders) when working in this repo.

## What this is

The **New Horizon** mobile companion: an Expo (React Native) project that talks to the same Supabase backend as the `newhorizonweb` web app. The current `NewHorizon/App.tsx` wires a bottom-tab navigator (Home / Feed / Notifications / Profile) over placeholder screens — most feature work still lives in the web repo. Treat this tree as a clean starting point for the mobile build-out.

The app lives under [`NewHorizon/`](./NewHorizon). **Open the repository root in VS Code** so the workspace settings, extension recommendations, and launch configs (which all point into `NewHorizon/`) are loaded.

## Stack

The authoritative versions live in `NewHorizon/package.json` — check there if anything below drifts. At time of writing:

- Expo SDK 57 (`expo: ~57.0.6`), React Native `0.86.0`, React 19
- TypeScript `~7.0.2` (strict mode, `extends "expo/tsconfig.base"`)
- Navigation: `@react-navigation/native` + `@react-navigation/bottom-tabs` (v7.x)
- Supabase JS client (`@supabase/supabase-js ^2.108.2`) + `expo-secure-store` for token storage
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
- `NewHorizon/package.json` — pinned to the SDK 57 dependency matrix; prefer `npx expo install <pkg>` over plain `npm install <pkg>` so new deps match the SDK.

## Conventions to follow

- **Secure storage**: use `expo-secure-store` for the Supabase session token (already wired in `lib/supabase.ts`); never `AsyncStorage` for secrets.
- **RLS-first data access**: hit the same Supabase project as `newhorizonweb`. Service identifiers (table names, RPCs like `increment_post_likes`) must match the schema in `newhorizonweb/new-horizon-web/supabase/database-schema.sql`. Never trust client-side filters — assume RLS will be the only enforcement.
- **Polyfill order**: keep `import 'react-native-url-polyfill/auto'` at the **top of `index.ts`**, before `App` or any transitive Supabase imports are evaluated.
- **Single navigation library**: keep navigation declarative under `@react-navigation/native`; don't introduce a second router.
- **Performance**: prefer `expo-image` over `<Image />` for cached / progressive image loading (compatible with the New Architecture). Install it first with `npx expo install expo-image` — it isn't in `package.json` yet.
- **Web smoke test**: run `npm run web` before opening a native simulator — same JS code path, much faster feedback loop.
- **SDK installs**: `npx expo install <pkg>` (not `npm install`) so version pins stay aligned with SDK 57.

## CI

Inside `.github/`:

- `workflows/codeql.yml` — CodeQL Advanced (JavaScript/TypeScript, build-mode `none`) on push/PR to `main`, plus a weekly Sunday schedule.
- `workflows/codacy.yml` — Codacy security analysis + SARIF upload on push/PR + weekly.
- `dependabot.yml` — weekly npm updates inside `/NewHorizon` (grouped: `expo`, `react-native`, `react-navigation`) and weekly GitHub Actions updates.

## VS Code

Open the repo root. Install recommended extensions (ESLint, Prettier, Expo Tools, React Native Tools, Pretty TS Errors, GitLens). The two launch configs are **"Expo: start"** (`npm start` in `NewHorizon/`) and **"Expo: web"** (`npm run web`).

---

## FeloniousApps build kit (suite-wide defaults)

These are the shared rules from the FeloniousApps build kit. Where they differ from this project's own rules above, this project's rules win.

You are a senior AI + full-stack developer building one of Michael's three-layer web apps. Follow these rules on every change.

### Golden rule
Every site must **run cleanly on localhost with zero errors or bugs, and the code must flow together.** Nothing is "done" until verified.

### Verification loop (run before reporting success)
1. Start the dev server.
2. Tail output; confirm it compiled with no build-breaking errors/warnings.
3. `curl -s -o /dev/null -w "%{http_code}" http://localhost:<port>` → expect `200`.
4. `npm run type-check` (`tsc --noEmit`) → 0 errors.
5. Only then report success. If anything errors, fix and re-verify — never hand back a broken site.

### Stack (default)
- **Frontend:** React 18 + Vite + TypeScript + Tailwind. Functional components + hooks only.
- **Backend/DB:** Supabase (Postgres + Auth + Storage). **RLS ON for every table** with explicit per-user policies. Schema changes go through SQL migrations in `supabase/migrations/` only.
- **AI layer:** Anthropic API. Persistent per-user companion with chat history in Supabase. `claude-sonnet-4-6` for in-app features, `claude-opus-4-8` for heavy reasoning. Send full history each call. Never ship API keys client-side — proxy through an Edge Function / server.
- Routing: React Router. UI: Radix UI (+ shadcn). Icons: lucide-react. Motion: Framer Motion. Tests: Vitest.

### Environment
- Windows + nvm-windows (`nvm use 20`). One dev server per port; kill stale processes first.
- Env vars: read `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` etc. from `.env`. If a var is missing, **fail loudly and name the exact var — never invent values.** Keep `.env.example` complete.
- If npm/installs fail on SSL/TLS, suspect antivirus (AVG) interception.

### Visual standard (enterprise-grade, intriguing)
Dark-first premium UI. Layered surfaces, low-opacity borders, soft shadows, glassmorphism panels (`backdrop-blur`). One bold accent + tasteful gradient on hero/CTAs. Generous whitespace, typographic scale, confident hero headline. Motion: scroll-reveal (fade + rise), button press-scale + hover-lift, card border-glow. Respect `prefers-reduced-motion`. Fully responsive 360→1440px. Accessible: semantic HTML, keyboard nav, focus rings, ARIA, WCAG AA. Loading skeletons, empty states, toasts — never raw spinners on primary content. Drive theme from CSS variables so it swaps in one place.

### Editing discipline
Surgical edits. Keep imports, routes, and naming consistent so the code flows together. Add/update types in `src/types`. Co-locate state; lift to context only when shared.

Reusable patterns for every build: @SKILLS.md
