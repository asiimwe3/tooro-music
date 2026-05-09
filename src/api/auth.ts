// ============================================================
// TOORO MUSIC - Auth API (Firebase)
// ============================================================

import auth from '@react-native-firebase/auth';
import { db } from './firebase';
import { User } from '../types';

export const authApi = {
  // Sign up with email/password
  signUp: async (email: string, password: string, fullName: string) => {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Update display name
    await user.updateProfile({ displayName: fullName });

    // Create profile in Firestore
    await db.profiles().doc(user.uid).set({
      id: user.uid,
      full_name: fullName,
      email,
      avatar_url: null,
      bio: null,
      username: null,
      is_artist: false,
      is_admin: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return userCredential;
  },

  // Sign in with email/password
  signIn: async (email: string, password: string) => {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    return userCredential;
  },

  // Sign out
  signOut: async () => {
    await auth().signOut();
  },

  // Get current Firebase user
  getCurrentUser: () => {
    return auth().currentUser;
  },

  // Get user profile from Firestore
  getUserProfile: async (userId: string): Promise<User> => {
    const doc = await db.profiles().doc(userId).get();
    if (!doc.exists) throw new Error('Profile not found');
    return { id: doc.id, ...doc.data() } as User;
  },

  // Update user profile
  updateProfile: async (userId: string, updates: Partial<User>) => {
    await db.profiles().doc(userId).update({
      ...updates,
      updated_at: new Date().toISOString(),
    });
    const doc = await db.profiles().doc(userId).get();
    return { id: doc.id, ...doc.data() } as User;
  },

  // Reset password
  resetPassword: async (email: string) => {
    await auth().sendPasswordResetEmail(email);
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (user: any) => void) => {
    return auth().onAuthStateChanged(callback);
  },
};
