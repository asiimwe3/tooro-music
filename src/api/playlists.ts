// ============================================================
// TOORO MUSIC - Playlists API
// ============================================================

import { supabase } from './supabase';
import { Playlist, Song } from '../types';

export const playlistsApi = {
  // Get user's playlists
  getUserPlaylists: async (userId: string) => {
    const { data, error } = await supabase
      .from('playlists')
      .select('*, creator:users(id, full_name, avatar_url)')
      .eq('creator_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data as Playlist[];
  },

  // Get public playlists
  getPublicPlaylists: async (limit = 10) => {
    const { data, error } = await supabase
      .from('playlists')
      .select('*, creator:users(id, full_name, avatar_url)')
      .eq('is_public', true)
      .order('followers_count', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data as Playlist[];
  },

  // Get playlist by ID with songs
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('playlists')
      .select(`
        *,
        creator:users(id, full_name, avatar_url),
        playlist_songs:playlist_songs(
          *,
          song:songs(*, artist:artists(id, name, avatar_url, verified))
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Playlist;
  },

  // Create playlist
  create: async (data: {
    title: string;
    description?: string;
    creator_id: string;
    is_public: boolean;
    is_collaborative?: boolean;
  }) => {
    const { data: playlist, error } = await supabase
      .from('playlists')
      .insert({
        ...data,
        songs_count: 0,
        followers_count: 0,
      })
      .select()
      .single();
    
    if (error) throw error;
    return playlist as Playlist;
  },

  // Add song to playlist
  addSong: async (playlistId: string, songId: string, userId: string) => {
    // Get current max position
    const { data: existing } = await supabase
      .from('playlist_songs')
      .select('position')
      .eq('playlist_id', playlistId)
      .order('position', { ascending: false })
      .limit(1);
    
    const nextPosition = (existing?.[0]?.position ?? -1) + 1;
    
    const { error } = await supabase
      .from('playlist_songs')
      .insert({
        playlist_id: playlistId,
        song_id: songId,
        added_by: userId,
        position: nextPosition,
      });
    
    if (error) throw error;
    
    // Update songs count
    await supabase.rpc('increment_playlist_songs', { playlist_id: playlistId });
  },

  // Remove song from playlist
  removeSong: async (playlistId: string, songId: string) => {
    const { error } = await supabase
      .from('playlist_songs')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('song_id', songId);
    
    if (error) throw error;
  },

  // Update playlist
  update: async (id: string, updates: Partial<Playlist>) => {
    const { data, error } = await supabase
      .from('playlists')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Playlist;
  },

  // Delete playlist
  delete: async (id: string) => {
    const { error } = await supabase
      .from('playlists')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};
