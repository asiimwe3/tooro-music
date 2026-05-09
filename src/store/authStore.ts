// ============================================================
// TOORO MUSIC - Auth Store (Firebase)
// ============================================================

import { create } from 'zustand';
import { authApi } from '../api/auth';
import { User } from '../types';

interface AuthState {
  user: User | null;
  firebaseUser: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  setFirebaseUser: (firebaseUser: any) => void;
  setUser: (user: User | null) => void;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  initialize: () => () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  firebaseUser: null,
  isLoading: true,
  isAuthenticated: false,

  setFirebaseUser: (firebaseUser) => {
    set({ firebaseUser, isAuthenticated: !!firebaseUser });
  },

  setUser: (user) => {
    set({ user });
  },

  signUp: async (email, password, fullName) => {
    set({ isLoading: true });
    try {
      const credential = await authApi.signUp(email, password, fullName);
      const profile = await authApi.getUserProfile(credential.user.uid);
      set({ user: profile, firebaseUser: credential.user, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true });
    try {
      const credential = await authApi.signIn(email, password);
      const profile = await authApi.getUserProfile(credential.user.uid);
      set({ user: profile, firebaseUser: credential.user, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    await authApi.signOut();
    set({ user: null, firebaseUser: null, isAuthenticated: false });
  },

  loadProfile: async (userId) => {
    try {
      const profile = await authApi.getUserProfile(userId);
      set({ user: profile });
    } catch (e) {
      console.error('Failed to load profile:', e);
    }
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) return;
    const updated = await authApi.updateProfile(user.id, updates);
    set({ user: updated });
  },

  // Initialize Firebase auth listener
  initialize: () => {
    set({ isLoading: true });
    const unsubscribe = authApi.onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        set({ firebaseUser, isAuthenticated: true });
        await get().loadProfile(firebaseUser.uid);
      } else {
        set({ firebaseUser: null, user: null, isAuthenticated: false });
      }
      set({ isLoading: false });
    });
    return unsubscribe;
  },
}));
