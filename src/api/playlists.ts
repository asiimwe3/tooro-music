// ============================================================
// TOORO MUSIC - Playlists API (Firebase)
// ============================================================

import firestore from '@react-native-firebase/firestore';
import { db } from './firebase';
import { Playlist, Song } from '../types';
import { songsApi } from './songs';

export const playlistsApi = {
  // Get user's playlists
  getUserPlaylists: async (userId: string): Promise<Playlist[]> => {
    const snapshot = await db.playlists()
      .where('user_id', '==', userId)
      .orderBy('updated_at', 'desc')
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Playlist));
  },

  // Get public playlists
  getPublic: async (limit = 20): Promise<Playlist[]> => {
    const snapshot = await db.playlists()
      .where('is_public', '==', true)
      .orderBy('songs_count', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Playlist));
  },

  // Get playlist by ID
  getById: async (id: string): Promise<Playlist> => {
    const doc = await db.playlists().doc(id).get();
    if (!doc.exists) throw new Error('Playlist not found');
    return { id: doc.id, ...doc.data() } as Playlist;
  },

  // Create playlist
  create: async (data: {
    name: string;
    user_id: string;
    description?: string;
    is_public?: boolean;
  }): Promise<Playlist> => {
    const docRef = await db.playlists().add({
      ...data,
      cover_url: null,
      songs_count: 0,
      song_ids: [],
      is_public: data.is_public ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Playlist;
  },

  // Add song to playlist
  addSong: async (playlistId: string, songId: string) => {
    await db.playlists().doc(playlistId).update({
      song_ids: firestore.FieldValue.arrayUnion(songId),
      songs_count: firestore.FieldValue.increment(1),
      updated_at: new Date().toISOString(),
    });
  },

  // Remove song from playlist
  removeSong: async (playlistId: string, songId: string) => {
    await db.playlists().doc(playlistId).update({
      song_ids: firestore.FieldValue.arrayRemove(songId),
      songs_count: firestore.FieldValue.increment(-1),
      updated_at: new Date().toISOString(),
    });
  },

  // Get songs in a playlist
  getPlaylistSongs: async (playlistId: string): Promise<Song[]> => {
    const playlist = await playlistsApi.getById(playlistId);
    const songIds: string[] = (playlist as any).song_ids || [];
    if (songIds.length === 0) return [];

    const songs = await Promise.all(
      songIds.map(id => songsApi.getById(id).catch(() => null))
    );
    return songs.filter(Boolean) as Song[];
  },

  // Update playlist
  update: async (playlistId: string, updates: Partial<Playlist>) => {
    await db.playlists().doc(playlistId).update({
      ...updates,
      updated_at: new Date().toISOString(),
    });
    return playlistsApi.getById(playlistId);
  },

  // Delete playlist
  delete: async (playlistId: string) => {
    await db.playlists().doc(playlistId).delete();
  },
};
