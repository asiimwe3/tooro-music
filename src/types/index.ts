// ============================================================
// TOORO MUSIC - Core Types
// ============================================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  role: 'listener' | 'artist' | 'admin';
  subscription_tier: 'free' | 'premium' | 'artist_pro';
  followers_count: number;
  following_count: number;
  created_at: string;
  updated_at: string;
  is_verified: boolean;
  country?: string;
  phone?: string;
}

export interface Artist {
  id: string;
  user_id: string;
  name: string;
  bio?: string;
  avatar_url?: string;
  cover_url?: string;
  genre: string[];
  verified: boolean;
  followers_count: number;
  monthly_listeners: number;
  total_streams: number;
  social_links?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
  };
  payout_info?: {
    method: string;
    account: string;
  };
  created_at: string;
  user?: User;
}

export interface Song {
  id: string;
  title: string;
  artist_id: string;
  album_id?: string;
  audio_url: string;
  cover_url?: string;
  duration: number; // in seconds
  genre: string;
  tags: string[];
  lyrics?: string;
  streams_count: number;
  likes_count: number;
  is_explicit: boolean;
  is_downloadable: boolean;
  is_premium: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'published';
  release_date: string;
  created_at: string;
  artist?: Artist;
  album?: Album;
  is_liked?: boolean;
  is_in_library?: boolean;
}

export interface Album {
  id: string;
  title: string;
  artist_id: string;
  cover_url?: string;
  description?: string;
  genre: string;
  release_date: string;
  songs_count: number;
  total_streams: number;
  is_published: boolean;
  created_at: string;
  artist?: Artist;
  songs?: Song[];
}

export interface Playlist {
  id: string;
  title: string;
  description?: string;
  cover_url?: string;
  creator_id: string;
  is_public: boolean;
  is_collaborative: boolean;
  songs_count: number;
  followers_count: number;
  created_at: string;
  updated_at: string;
  creator?: User;
  songs?: PlaylistSong[];
}

export interface PlaylistSong {
  id: string;
  playlist_id: string;
  song_id: string;
  position: number;
  added_by: string;
  added_at: string;
  song?: Song;
}

export interface Comment {
  id: string;
  user_id: string;
  song_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  user?: User;
  is_liked?: boolean;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'new_follower' | 'song_like' | 'comment' | 'new_release' | 'system';
  title: string;
  body: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
  sender?: User;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'free' | 'premium' | 'artist_pro';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  starts_at: string;
  ends_at?: string;
  amount?: number;
  currency: string;
  payment_method?: string;
  created_at: string;
}

export interface Analytics {
  id: string;
  song_id?: string;
  artist_id?: string;
  user_id?: string;
  event_type: 'play' | 'skip' | 'complete' | 'like' | 'share' | 'download';
  platform: 'android' | 'ios' | 'web';
  country?: string;
  created_at: string;
}

// Player types
export interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  queueIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  position: number;
  duration: number;
  repeatMode: 'off' | 'one' | 'all';
  shuffleEnabled: boolean;
  volume: number;
  miniPlayerVisible: boolean;
}

// Navigation types
export type RootStackParamList = {
  '(tabs)': undefined;
  '(auth)': undefined;
  'song/[id]': { id: string };
  'artist/[id]': { id: string };
  'album/[id]': { id: string };
  'playlist/[id]': { id: string };
  'player': undefined;
};

export type Genre = 
  | 'Afrobeat'
  | 'Amapiano'
  | 'Gospel'
  | 'Hip Hop'
  | 'Traditional'
  | 'R&B'
  | 'Dancehall'
  | 'Reggae'
  | 'Pop'
  | 'Jazz'
  | 'Tooro'
  | 'Luganda'
  | 'Runyoro'
  | 'Electronic';

export interface SearchResult {
  songs: Song[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
}

export interface ChartEntry {
  position: number;
  previousPosition?: number;
  song: Song;
  streams: number;
  change: 'up' | 'down' | 'new' | 'same';
}
