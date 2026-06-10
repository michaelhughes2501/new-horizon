import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * `true` only when both Supabase env vars are present. When false the app
 * runs in a self-contained "preview" mode against local demo data so it can
 * boot and be evaluated (and pass App Store review screenshots) without a
 * live backend. Set EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY
 * in NewHorizon/.env to enable the real Supabase backend.
 */
export const BACKEND_READY = Boolean(supabaseUrl && supabaseAnonKey);

if (!BACKEND_READY && process.env.NODE_ENV !== 'test') {
  // eslint-disable-next-line no-console
  console.warn(
    '[New Horizon] Running in preview mode — add EXPO_PUBLIC_SUPABASE_URL and ' +
      'EXPO_PUBLIC_SUPABASE_ANON_KEY to NewHorizon/.env to connect the live backend.'
  );
}

// Use harmless placeholders when unconfigured so the client constructs without
// throwing; no network calls are made while BACKEND_READY is false.
export const supabase = createClient(
  supabaseUrl || 'https://preview.invalid',
  supabaseAnonKey || 'preview-anon-key',
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: BACKEND_READY,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
