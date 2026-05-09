// ============================================================
// TOORO MUSIC - Songs API (Firebase)
// ============================================================

import firestore from '@react-native-firebase/firestore';
import { db } from './firebase';
import { Song } from '../types';

export const songsApi = {
  // Get trending songs (most plays)
  getTrending: async (limit = 10): Promise<Song[]> => {
    const snapshot = await db.songs()
      .where('is_published', '==', true)
      .orderBy('plays_count', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Song));
  },

  // Get new releases
  getNewReleases: async (limit = 10): Promise<Song[]> => {
    const snapshot = await db.songs()
      .where('is_published', '==', true)
      .orderBy('release_date', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Song));
  },

  // Get songs by genre
  getByGenre: async (genre: string, limit = 20): Promise<Song[]> => {
    const snapshot = await db.songs()
      .where('is_published', '==', true)
      .where('genre', '==', genre)
      .orderBy('plays_count', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Song));
  },

  // Get song by ID
  getById: async (id: string): Promise<Song> => {
    const doc = await db.songs().doc(id).get();
    if (!doc.exists) throw new Error('Song not found');
    return { id: doc.id, ...doc.data() } as Song;
  },

  // Get songs by artist
  getByArtist: async (artistId: string, limit = 20): Promise<Song[]> => {
    const snapshot = await db.songs()
      .where('artist_id', '==', artistId)
      .where('is_published', '==', true)
      .orderBy('plays_count', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Song));
  },

  // Get Tooro Charts (regional genres)
  getTooroCharts: async (limit = 20): Promise<Song[]> => {
    const snapshot = await db.songs()
      .where('is_published', '==', true)
      .where('genre', 'in', ['Traditional', 'Gospel', 'Afrobeat', 'Amapiano'])
      .orderBy('plays_count', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Song));
  },

  // Search songs by title (client-side filter after fetch)
  search: async (query: string): Promise<Song[]> => {
    const snapshot = await db.songs()
      .where('is_published', '==', true)
      .orderBy('plays_count', 'desc')
      .limit(100)
      .get();

    const lower = query.toLowerCase();
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Song))
      .filter(song =>
        song.title?.toLowerCase().includes(lower) ||
        song.artist_name?.toLowerCase().includes(lower)
      );
  },

  // Like a song
  likeSong: async (songId: string, userId: string) => {
    const likeId = `${userId}_${songId}`;
    await db.songLikes().doc(likeId).set({
      user_id: userId,
      song_id: songId,
      created_at: new Date().toISOString(),
    });
    // Increment likes count
    await db.songs().doc(songId).update({
      likes_count: firestore.FieldValue.increment(1),
    });
  },

  // Unlike a song
  unlikeSong: async (songId: string, userId: string) => {
    const likeId = `${userId}_${songId}`;
    await db.songLikes().doc(likeId).delete();
    await db.songs().doc(songId).update({
      likes_count: firestore.FieldValue.increment(-1),
    });
  },

  // Toggle like
  toggleLike: async (songId: string, userId: string): Promise<boolean> => {
    const likeId = `${userId}_${songId}`;
    const doc = await db.songLikes().doc(likeId).get();
    if (doc.exists) {
      await songsApi.unlikeSong(songId, userId);
      return false;
    } else {
      await songsApi.likeSong(songId, userId);
      return true;
    }
  },

  // Check if user liked a song
  isLiked: async (songId: string, userId: string): Promise<boolean> => {
    const likeId = `${userId}_${songId}`;
    const doc = await db.songLikes().doc(likeId).get();
    return doc.exists;
  },

  // Get user's liked songs
  getLikedSongs: async (userId: string): Promise<Song[]> => {
    const snapshot = await db.songLikes()
      .where('user_id', '==', userId)
      .orderBy('created_at', 'desc')
      .get();

    const songIds = snapshot.docs.map(doc => doc.data().song_id);
    if (songIds.length === 0) return [];

    const songs = await Promise.all(
      songIds.map(id => songsApi.getById(id))
    );
    return songs.filter(Boolean);
  },

  // Record a play
  recordPlay: async (songId: string, userId?: string) => {
    await db.songs().doc(songId).update({
      plays_count: firestore.FieldValue.increment(1),
    });

    if (userId) {
      await db.playHistory().add({
        user_id: userId,
        song_id: songId,
        played_at: new Date().toISOString(),
      });
    }
  },

  // Get recently played
  getRecentlyPlayed: async (userId: string, limit = 10): Promise<Song[]> => {
    const snapshot = await db.playHistory()
      .where('user_id', '==', userId)
      .orderBy('played_at', 'desc')
      .limit(limit * 2)
      .get();

    const seen = new Set<string>();
    const uniqueSongIds: string[] = [];

    for (const doc of snapshot.docs) {
      const songId = doc.data().song_id;
      if (!seen.has(songId)) {
        seen.add(songId);
        uniqueSongIds.push(songId);
        if (uniqueSongIds.length >= limit) break;
      }
    }

    const songs = await Promise.all(
      uniqueSongIds.map(id => songsApi.getById(id).catch(() => null))
    );
    return songs.filter(Boolean) as Song[];
  },

  // Upload a new song (artist)
  upload: async (songData: {
    title: string;
    artist_id: string;
    artist_name: string;
    audio_url: string;
    cover_url?: string;
    duration: number;
    genre: string;
    lyrics?: string;
    is_premium?: boolean;
  }) => {
    const docRef = await db.songs().add({
      ...songData,
      is_published: false,
      plays_count: 0,
      likes_count: 0,
      release_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Song;
  },
};
