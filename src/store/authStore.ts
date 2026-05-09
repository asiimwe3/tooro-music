// ============================================================
// TOORO MUSIC - Auth Store (Zustand)
// ============================================================

import { create } from 'zustand';
import { User } from '../types';
import { authApi } from '../api/auth';
import { supabase } from '../api/supabase';

interface AuthState {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  initialize: async () => {
    try {
      set({ isLoading: true });
      
      const session = await authApi.getSession();
      
      if (session?.user) {
        try {
          const profile = await authApi.getUserProfile(session.user.id);
          set({ user: profile, session, isInitialized: true, isLoading: false });
        } catch {
          // Profile not created yet
          set({ session, isInitialized: true, isLoading: false });
        }
      } else {
        set({ isInitialized: true, isLoading: false });
      }

      // Listen for auth changes
      authApi.onAuthStateChange(async (session) => {
        if (session?.user) {
          try {
            const profile = await authApi.getUserProfile(session.user.id);
            set({ user: profile, session });
          } catch {
            set({ session });
          }
        } else {
          set({ user: null, session: null });
        }
      });
    } catch (error: any) {
      set({ error: error.message, isInitialized: true, isLoading: false });
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { session } = await authApi.signIn(email, password);
      if (session?.user) {
        const profile = await authApi.getUserProfile(session.user.id);
        set({ user: profile, session, isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  signUp: async (email, password, fullName) => {
    set({ isLoading: true, error: null });
    try {
      const { session } = await authApi.signUp(email, password, fullName);
      if (session?.user) {
        // Create user profile
        const profile = await authApi.getUserProfile(session.user.id);
        set({ user: profile, session, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      await authApi.signInWithGoogle();
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await authApi.signOut();
      set({ user: null, session: null, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return;
    
    set({ isLoading: true });
    try {
      const updated = await authApi.updateProfile(user.id, updates);
      set({ user: updated, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
