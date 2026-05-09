// ============================================================
// TOORO MUSIC - App Constants
// ============================================================

export const APP_NAME = 'Tooro Music';
export const APP_TAGLINE = 'The Sound of Western Uganda';
export const APP_VERSION = '1.0.0';

// Colors
export const COLORS = {
  // Background
  BG_PRIMARY: '#0A0A0F',
  BG_CARD: '#12121A',
  BG_SURFACE: '#1A1A2E',
  BG_ELEVATED: '#1E1E30',
  
  // Brand
  PURPLE: '#7C3AED',
  PURPLE_LIGHT: '#9D4EDD',
  PURPLE_DARK: '#4C1D95',
  GOLD: '#F59E0B',
  GOLD_DARK: '#D97706',
  
  // Text
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: '#B3B3CC',
  TEXT_MUTED: '#6B7280',
  TEXT_ACCENT: '#F59E0B',
  
  // Status
  SUCCESS: '#10B981',
  ERROR: '#EF4444',
  WARNING: '#F59E0B',
  INFO: '#3B82F6',
  
  // Borders
  BORDER: '#2D2D44',
  BORDER_LIGHT: '#3D3D5A',
  
  // Gradients (for use with LinearGradient)
  GRADIENT_BRAND: ['#0A0A0F', '#1A0A2E', '#0A0A0F'],
  GRADIENT_PURPLE: ['#7C3AED', '#4C1D95'],
  GRADIENT_GOLD: ['#F59E0B', '#D97706'],
  GRADIENT_DARK: ['rgba(10,10,15,0)', '#0A0A0F'],
  GRADIENT_PLAYER: ['rgba(10,10,15,0)', 'rgba(10,10,15,0.8)', '#0A0A0F'],
  GRADIENT_CARD: ['#1A1A2E', '#12121A'],
} as const;

// Typography
export const FONTS = {
  HEADING: 'Poppins-Bold',
  HEADING_MEDIUM: 'Poppins-SemiBold',
  HEADING_REGULAR: 'Poppins-Regular',
  BODY: 'Inter-Regular',
  BODY_MEDIUM: 'Inter-Medium',
  BODY_BOLD: 'Inter-Bold',
  MONO: 'JetBrainsMono-Regular',
} as const;

export const FONT_SIZES = {
  XS: 10,
  SM: 12,
  BASE: 14,
  MD: 16,
  LG: 18,
  XL: 20,
  '2XL': 24,
  '3XL': 28,
  '4XL': 32,
  '5XL': 40,
  '6XL': 48,
} as const;

// Spacing
export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 12,
  LG: 16,
  XL: 20,
  '2XL': 24,
  '3XL': 32,
  '4XL': 40,
  '5XL': 48,
  '6XL': 64,
} as const;

// Border Radius
export const RADIUS = {
  SM: 6,
  MD: 10,
  LG: 16,
  XL: 20,
  '2XL': 24,
  '3XL': 32,
  FULL: 9999,
} as const;

// Genres
export const GENRES = [
  'Afrobeat',
  'Amapiano',
  'Gospel',
  'Hip Hop',
  'Traditional',
  'R&B',
  'Dancehall',
  'Reggae',
  'Pop',
  'Jazz',
  'Tooro',
  'Luganda',
  'Runyoro',
  'Electronic',
] as const;

// Genre Colors (for cards/badges)
export const GENRE_COLORS: Record<string, string[]> = {
  'Afrobeat': ['#FF6B35', '#FF3D00'],
  'Amapiano': ['#A855F7', '#7C3AED'],
  'Gospel': ['#F59E0B', '#D97706'],
  'Hip Hop': ['#1F2937', '#111827'],
  'Traditional': ['#10B981', '#059669'],
  'R&B': ['#EC4899', '#BE185D'],
  'Dancehall': ['#F97316', '#EA580C'],
  'Reggae': ['#84CC16', '#65A30D'],
  'Pop': ['#06B6D4', '#0891B2'],
  'Jazz': ['#6366F1', '#4F46E5'],
  'Tooro': ['#7C3AED', '#4C1D95'],
  'Luganda': ['#EF4444', '#DC2626'],
  'Runyoro': ['#14B8A6', '#0D9488'],
  'Electronic': ['#8B5CF6', '#7C3AED'],
};

// Player
export const PLAYER = {
  MINI_HEIGHT: 72,
  FULL_SCREEN_BG: COLORS.BG_PRIMARY,
  ARTWORK_SIZE: 280,
  SEEK_INTERVAL: 10, // seconds
};

// Pagination
export const PAGE_SIZE = 20;

// Storage Buckets
export const STORAGE = {
  AUDIO: 'audio',
  COVERS: 'covers',
  AVATARS: 'avatars',
  BANNERS: 'banners',
};

// API Endpoints
export const API = {
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
};

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'UGX',
    features: [
      'Stream music with ads',
      'Limited skips',
      'Standard quality',
      'Create 3 playlists',
    ],
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: 15000,
    currency: 'UGX',
    features: [
      'Ad-free streaming',
      'Unlimited skips',
      'High quality audio',
      'Unlimited playlists',
      'Offline downloads',
      'Background play',
    ],
  },
  ARTIST_PRO: {
    id: 'artist_pro',
    name: 'Artist Pro',
    price: 30000,
    currency: 'UGX',
    features: [
      'Everything in Premium',
      'Upload unlimited songs',
      'Detailed analytics',
      'Artist verification badge',
      'Priority support',
      'Payout tracking',
    ],
  },
} as const;

// Animation Durations
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 800,
} as const;
