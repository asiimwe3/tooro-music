// ============================================================
// TOORO MUSIC - Songs API
// ============================================================

import { supabase } from './supabase';
import { Song, SearchResult } from '../types';
import { PAGE_SIZE } from '../constants';

export const songsApi = {
  // Get trending songs
  getTrending: async (limit = 10) => {
    const { data, error } = await supabase
      .from('songs')
      .select(`
        *,
        artist:artists(id, name, avatar_url, verified)
      `)
      .eq('status', 'published')
      .order('streams_count', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data as Song[];
  },

  // Get new releases
  getNewReleases: async (limit = 10) => {
    const { data, error } = await supabase
      .from('songs')
      .select(`
        *,
        artist:artists(id, name, avatar_url, verified)
      `)
      .eq('status', 'published')
      .order('release_date', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data as Song[];
  },

  // Get songs by genre
  getByGenre: async (genre: string, limit = PAGE_SIZE, offset = 0) => {
    const { data, error } = await supabase
      .from('songs')
      .select(`
        *,
        artist:artists(id, name, avatar_url, verified)
      `)
      .eq('status', 'published')
      .eq('genre', genre)
      .order('streams_count', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data as Song[];
  },

  // Get song by ID
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('songs')
      .select(`
        *,
        artist:artists(*, user:users(*)),
        album:albums(id, title, cover_url)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Song;
  },

  // Search songs
  search: async (query: string): Promise<SearchResult> => {
    const searchQuery = `%${query}%`;
    
    const [songsRes, artistsRes, albumsRes, playlistsRes] = await Promise.all([
      supabase
        .from('songs')
        .select('*, artist:artists(id, name, avatar_url, verified)')
        .eq('status', 'published')
        .ilike('title', searchQuery)
        .limit(10),
      supabase
        .from('artists')
        .select('*')
        .ilike('name', searchQuery)
        .limit(5),
      supabase
        .from('albums')
        .select('*, artist:artists(id, name, avatar_url)')
        .eq('is_published', true)
        .ilike('title', searchQuery)
        .limit(5),
      supabase
        .from('playlists')
        .select('*, creator:users(id, full_name, avatar_url)')
        .eq('is_public', true)
        .ilike('title', searchQuery)
        .limit(5),
    ]);

    return {
      songs: songsRes.data || [],
      artists: artistsRes.data || [],
      albums: albumsRes.data || [],
      playlists: playlistsRes.data || [],
    };
  },

  // Get Tooro Charts (regional)
  getTooroCharts: async (limit = 20) => {
    const { data, error } = await supabase
      .from('songs')
      .select(`
        *,
        artist:artists(id, name, avatar_url, verified)
      `)
      .eq('status', 'published')
      .in('genre', ['Tooro', 'Runyoro', 'Traditional', 'Gospel'])
      .order('streams_count', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data as Song[];
  },

  // Like/unlike a song
  toggleLike: async (songId: string, userId: string) => {
    const { data: existing } = await supabase
      .from('likes')
      .select('id')
      .eq('song_id', songId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('song_id', songId)
        .eq('user_id', userId);
      if (error) throw error;
      return false; // unliked
    } else {
      const { error } = await supabase
        .from('likes')
        .insert({ song_id: songId, user_id: userId });
      if (error) throw error;
      return true; // liked
    }
  },

  // Check if user liked a song
  isLiked: async (songId: string, userId: string) => {
    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('song_id', songId)
      .eq('user_id', userId)
      .single();
    return !!data;
  },

  // Get user's liked songs
  getLikedSongs: async (userId: string) => {
    const { data, error } = await supabase
      .from('likes')
      .select('*, song:songs(*, artist:artists(id, name, avatar_url, verified))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data?.map(l => l.song) || []) as Song[];
  },

  // Record play event
  recordPlay: async (songId: string, userId?: string) => {
    // Increment stream count
    await supabase.rpc('increment_streams', { song_id: songId });
    
    // Record analytics
    if (userId) {
      await supabase.from('analytics').insert({
        song_id: songId,
        user_id: userId,
        event_type: 'play',
        platform: 'android',
      });
    }
  },

  // Upload a song (for artists)
  upload: async (songData: {
    title: string;
    artist_id: string;
    audio_url: string;
    cover_url?: string;
    duration: number;
    genre: string;
    tags?: string[];
    lyrics?: string;
    album_id?: string;
    is_explicit?: boolean;
    is_downloadable?: boolean;
    is_premium?: boolean;
  }) => {
    const { data, error } = await supabase
      .from('songs')
      .insert({
        ...songData,
        status: 'pending',
        streams_count: 0,
        likes_count: 0,
        release_date: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as Song;
  },

  // Get recently played (from analytics)
  getRecentlyPlayed: async (userId: string, limit = 10) => {
    const { data, error } = await supabase
      .from('analytics')
      .select('*, song:songs(*, artist:artists(id, name, avatar_url, verified))')
      .eq('user_id', userId)
      .eq('event_type', 'play')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    // Deduplicate by song ID
    const seen = new Set();
    const unique = data?.filter(item => {
      if (seen.has(item.song_id)) return false;
      seen.add(item.song_id);
      return true;
    }) || [];
    
    return unique.map(item => item.song) as Song[];
  },
};
