import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

// Native (iOS/Android): session tokens live in the OS keychain/keystore.
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// Web: expo-secure-store has no web implementation (its calls throw), so fall
// back to the browser's localStorage — the same storage supabase-js uses by
// default in browsers. Guarded for non-browser contexts (e.g. static render).
const webStorage = typeof globalThis.localStorage !== 'undefined' ? globalThis.localStorage : null;
const WebStorageAdapter = {
  getItem: async (key: string) => webStorage?.getItem(key) ?? null,
  setItem: async (key: string, value: string) => {
    webStorage?.setItem(key, value);
  },
  removeItem: async (key: string) => {
    webStorage?.removeItem(key);
  },
};

const authStorage = Platform.OS === 'web' ? WebStorageAdapter : ExpoSecureStoreAdapter;

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
      storage: authStorage,
      autoRefreshToken: BACKEND_READY,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
