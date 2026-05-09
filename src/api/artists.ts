// ============================================================
// TOORO MUSIC - Artists API (Firebase)
// ============================================================

import firestore from '@react-native-firebase/firestore';
import { db } from './firebase';
import { Artist } from '../types';

export const artistsApi = {
  // Get featured / verified artists
  getFeatured: async (limit = 8): Promise<Artist[]> => {
    const snapshot = await db.artists()
      .where('verified', '==', true)
      .orderBy('followers_count', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Artist));
  },

  // Get all artists
  getAll: async (limit = 20): Promise<Artist[]> => {
    const snapshot = await db.artists()
      .orderBy('followers_count', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Artist));
  },

  // Get artist by ID
  getById: async (id: string): Promise<Artist> => {
    const doc = await db.artists().doc(id).get();
    if (!doc.exists) throw new Error('Artist not found');
    return { id: doc.id, ...doc.data() } as Artist;
  },

  // Search artists
  search: async (query: string): Promise<Artist[]> => {
    const snapshot = await db.artists()
      .orderBy('followers_count', 'desc')
      .limit(100)
      .get();

    const lower = query.toLowerCase();
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Artist))
      .filter(a => a.name?.toLowerCase().includes(lower));
  },

  // Follow an artist
  follow: async (artistId: string, userId: string) => {
    const followId = `${userId}_${artistId}`;
    await db.artistFollows().doc(followId).set({
      user_id: userId,
      artist_id: artistId,
      created_at: new Date().toISOString(),
    });
    await db.artists().doc(artistId).update({
      followers_count: firestore.FieldValue.increment(1),
    });
  },

  // Unfollow an artist
  unfollow: async (artistId: string, userId: string) => {
    const followId = `${userId}_${artistId}`;
    await db.artistFollows().doc(followId).delete();
    await db.artists().doc(artistId).update({
      followers_count: firestore.FieldValue.increment(-1),
    });
  },

  // Toggle follow
  toggleFollow: async (artistId: string, userId: string): Promise<boolean> => {
    const followId = `${userId}_${artistId}`;
    const doc = await db.artistFollows().doc(followId).get();
    if (doc.exists) {
      await artistsApi.unfollow(artistId, userId);
      return false;
    } else {
      await artistsApi.follow(artistId, userId);
      return true;
    }
  },

  // Check if following
  isFollowing: async (artistId: string, userId: string): Promise<boolean> => {
    const followId = `${userId}_${artistId}`;
    const doc = await db.artistFollows().doc(followId).get();
    return doc.exists;
  },

  // Get artists the user follows
  getFollowedArtists: async (userId: string): Promise<Artist[]> => {
    const snapshot = await db.artistFollows()
      .where('user_id', '==', userId)
      .orderBy('created_at', 'desc')
      .get();

    const artistIds = snapshot.docs.map(doc => doc.data().artist_id);
    if (artistIds.length === 0) return [];

    const artists = await Promise.all(
      artistIds.map(id => artistsApi.getById(id).catch(() => null))
    );
    return artists.filter(Boolean) as Artist[];
  },

  // Create artist profile
  create: async (artistData: Omit<Artist, 'id'>) => {
    const docRef = await db.artists().add({
      ...artistData,
      verified: false,
      followers_count: 0,
      monthly_listeners: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Artist;
  },

  // Update artist profile
  update: async (artistId: string, updates: Partial<Artist>) => {
    await db.artists().doc(artistId).update({
      ...updates,
      updated_at: new Date().toISOString(),
    });
    return artistsApi.getById(artistId);
  },
};
