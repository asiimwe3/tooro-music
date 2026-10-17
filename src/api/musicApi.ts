// Tooro Music — Real data API from Base44 backend

const BASE = "https://base44.app/api/apps/6a06dff0946d9cf169ac63e2/functions";

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
    const res = await fetch(`${BASE}/musicArtists`);
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
    const res = await fetch(`${BASE}/musicSongs`);
    const data = await res.json();
    _songs = (data.data || []).filter((s: RealSong) => s.isActive);
    return _songs!;
  } catch {
    return [];
  }
}

export async function fetchAll(): Promise<{ artists: RealArtist[]; songs: RealSong[] }> {
  const [artists, songs] = await Promise.all([fetchArtists(), fetchSongs()]);
  return { artists, songs };
}

// PesaPal payment
