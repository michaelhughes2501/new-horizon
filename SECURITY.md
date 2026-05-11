# Security Policy

## Reporting

Use a private security advisory in this repo. Do not file public issues for security problems.

## Mobile-specific notes

- Secrets go through `expo-secure-store` (not AsyncStorage).
- Only `EXPO_PUBLIC_*` env vars reach the client bundle.
- Supabase Row-Level Security is required for any user data.
- Rotate the Supabase anon key if it ever leaks in screenshots/logs.
