// ============================================================
// TOORO MUSIC - Artists API
// ============================================================

import { supabase } from './supabase';
import { Artist, Song, Album } from '../types';

export const artistsApi = {
  // Get featured artists
  getFeatured: async (limit = 8) => {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .eq('verified', true)
      .order('monthly_listeners', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data as Artist[];
  },

  // Get artist by ID
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('artists')
      .select('*, user:users(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Artist;
  },

  // Get artist's songs
  getArtistSongs: async (artistId: string, limit = 20) => {
    const { data, error } = await supabase
      .from('songs')
      .select('*, artist:artists(id, name, avatar_url, verified)')
      .eq('artist_id', artistId)
      .eq('status', 'published')
      .order('streams_count', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data as Song[];
  },

  // Get artist's albums
  getArtistAlbums: async (artistId: string) => {
    const { data, error } = await supabase
      .from('albums')
      .select('*, artist:artists(id, name, avatar_url)')
      .eq('artist_id', artistId)
      .eq('is_published', true)
      .order('release_date', { ascending: false });
    
    if (error) throw error;
    return data as Album[];
  },

  // Follow/unfollow artist
  toggleFollow: async (artistId: string, userId: string) => {
    const { data: existing } = await supabase
      .from('followers')
      .select('id')
      .eq('artist_id', artistId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      await supabase
        .from('followers')
        .delete()
        .eq('artist_id', artistId)
        .eq('user_id', userId);
      return false;
    } else {
      await supabase
        .from('followers')
        .insert({ artist_id: artistId, user_id: userId });
      return true;
    }
  },

  // Check if following
  isFollowing: async (artistId: string, userId: string) => {
    const { data } = await supabase
      .from('followers')
      .select('id')
      .eq('artist_id', artistId)
      .eq('user_id', userId)
      .single();
    return !!data;
  },

  // Get followed artists
  getFollowedArtists: async (userId: string) => {
    const { data, error } = await supabase
      .from('followers')
      .select('*, artist:artists(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data?.map(f => f.artist) as Artist[];
  },

  // Get artist analytics
  getAnalytics: async (artistId: string) => {
    const { data, error } = await supabase
      .from('analytics')
      .select('event_type, created_at')
      .eq('artist_id', artistId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Update artist profile
  update: async (artistId: string, updates: Partial<Artist>) => {
    const { data, error } = await supabase
      .from('artists')
      .update(updates)
      .eq('id', artistId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Artist;
  },

  // Create artist profile (when user becomes an artist)
  create: async (artistData: {
    user_id: string;
    name: string;
    bio?: string;
    genre: string[];
  }) => {
    const { data, error } = await supabase
      .from('artists')
      .insert({
        ...artistData,
        verified: false,
        followers_count: 0,
        monthly_listeners: 0,
        total_streams: 0,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as Artist;
  },

  // Search artists
  search: async (query: string) => {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(10);
    
    if (error) throw error;
    return data as Artist[];
  },
};
