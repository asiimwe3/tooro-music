// ============================================================
// TOORO MUSIC - Supabase Client
// ============================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Custom storage adapter using SecureStore on mobile, AsyncStorage as fallback
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(key);
    }
    try {
      const value = await SecureStore.getItemAsync(key);
      return value;
    } catch {
      return AsyncStorage.getItem(key);
    }
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      return AsyncStorage.setItem(key, value);
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      return AsyncStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return AsyncStorage.removeItem(key);
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      return AsyncStorage.removeItem(key);
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export default supabase;
