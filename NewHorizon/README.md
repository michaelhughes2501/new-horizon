# NewHorizon

Expo (React Native) mobile companion for New Horizon. See the repo root [`CLAUDE.md`](../CLAUDE.md) for full setup, environment, and convention notes.

## Quick start

```bash
npm install
npm run web    # fastest smoke test (expo start --web)
npm start      # expo start (Metro + dev menu)
```

Copy `.env.example` to `.env` and fill in `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` to connect to a real Supabase backend. Without them, the app boots in a self-contained preview mode using local demo data.
