// Tooro Music — Real data API from Base44 backend

const BASE = "https://base44.app/api/apps/69ff30768e50f82540c24b7a/functions";

export interface RealArtist {
  id: string;
  artistId: string;
  name: string;
  genre: string;
  bio: string;
  followers: string;
  monthlyListeners: string;
  songs: number;
  verified: boolean;
  color: string;
  imageUrl: string;
  location: string;
  isActive: boolean;
}

export interface RealSong {
  id: string;
  songId: string;
  title: string;
  artistId: string;
  artist: string;
  genre: string;
  duration: string;
  plays: string;
  audioUrl: string;
  coverUrl: string;
  color: string;
  isActive: boolean;
  featured: boolean;
}

let _artists: RealArtist[] | null = null;
let _songs: RealSong[] | null = null;

export async function fetchArtists(): Promise<RealArtist[]> {
  if (_artists) return _artists;
  try {
    const res = await fetch(`${BASE}/musicData/artists`);
    const data = await res.json();
    _artists = (data.data || []).filter((a: RealArtist) => a.isActive);
    return _artists!;
  } catch {
    return [];
  }
}

export async function fetchSongs(): Promise<RealSong[]> {
  if (_songs) return _songs;
  try {
    const res = await fetch(`${BASE}/musicData/songs`);
    const data = await res.json();
    _songs = (data.data || []).filter((s: RealSong) => s.isActive);
    return _songs!;
  } catch {
    return [];
  }
}

export async function fetchAll(): Promise<{ artists: RealArtist[]; songs: RealSong[] }> {
  try {
    const res = await fetch(`${BASE}/musicData`);
    const data = await res.json();
    _artists = (data.artists || []).filter((a: RealArtist) => a.isActive);
    _songs = (data.songs || []).filter((s: RealSong) => s.isActive);
    return { artists: _artists!, songs: _songs! };
  } catch {
    return { artists: [], songs: [] };
  }
}

// PesaPal payment
export const PAYMENT_URL = "https://base44.app/api/apps/69ff30768e50f82540c24b7a/functions/pesapalPayment";
