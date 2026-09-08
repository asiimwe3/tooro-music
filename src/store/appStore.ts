import { create } from "zustand";
import { SONGS } from "../data/mock";
import { onAuthChange, AuthUser } from "../api/firebase";

type Song = (typeof SONGS)[0];
type Page = "home" | "discover" | "trending" | "artist" | "premium";
type ArtistTab = "dashboard" | "upload" | "analytics" | "promote" | "monetize" | "collab" | "subscribe";

interface AppState {
  page: Page;
  setPage: (p: Page) => void;
  artistTab: ArtistTab;
  setArtistTab: (t: ArtistTab) => void;
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  playbackSpeed: number;
  playSong: (s: Song) => void;
  togglePlay: () => void;
  nextSong: () => void;
  prevSong: () => void;
  setProgress: (p: number) => void;
  setPlaybackSpeed: (s: number) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedGenre: string | null;
  setSelectedGenre: (g: string | null) => void;
  payTarget: { name: string; amount: number; planId?: string } | null;
  openPayment: (name: string, amount: number, planId?: string) => void;
  closePayment: () => void;
  uploadModal: "none" | "song" | "video";
  openUpload: (t: "song" | "video") => void;
  closeUpload: () => void;
  toast: string;
  showToast: (msg: string) => void;
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
  sideMenuOpen: boolean;
  setSideMenuOpen: (v: boolean) => void;
  authModal: "none" | "login" | "register";
  setAuthModal: (v: "none" | "login" | "register") => void;
  artistView: string | null;
  setArtistView: (id: string | null) => void;
  pesapalModal: boolean;
  setPesapalModal: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => {
  // Subscribe to real Firebase auth
  onAuthChange((user) => set({ user }));

  return {
    page: "home",
    setPage: (page) => set({ page }),
    artistTab: "dashboard",
    setArtistTab: (artistTab) => set({ artistTab }),
    currentSong: null,
    isPlaying: false,
    progress: 0,
    playbackSpeed: 1,
    playSong: (song) => set({ currentSong: song, isPlaying: true, progress: 0 }),
    togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
    nextSong: () => {
      const { currentSong } = get();
      if (!currentSong) return;
      const idx = SONGS.findIndex((s) => s.id === currentSong.id);
      set({ currentSong: SONGS[(idx + 1) % SONGS.length], isPlaying: true, progress: 0 });
    },
    prevSong: () => {
      const { currentSong } = get();
      if (!currentSong) return;
      const idx = SONGS.findIndex((s) => s.id === currentSong.id);
      set({ currentSong: SONGS[(idx - 1 + SONGS.length) % SONGS.length], isPlaying: true, progress: 0 });
    },
    setProgress: (progress) => set({ progress }),
    setPlaybackSpeed: (playbackSpeed) => set({ playbackSpeed }),
    searchQuery: "",
    setSearchQuery: (searchQuery) => set({ searchQuery }),
    selectedGenre: null,
    setSelectedGenre: (selectedGenre) => set({ selectedGenre }),
    payTarget: null,
    openPayment: (name, amount, planId) => set({ payTarget: { name, amount, planId }, pesapalModal: true }),
    closePayment: () => set({ payTarget: null, pesapalModal: false }),
    uploadModal: "none",
    openUpload: (t) => set({ uploadModal: t }),
    closeUpload: () => set({ uploadModal: "none" }),
    toast: "",
    showToast: (msg) => { set({ toast: msg }); setTimeout(() => set({ toast: "" }), 3500); },
    user: null,
    setUser: (user) => set({ user }),
    sideMenuOpen: false,
    setSideMenuOpen: (sideMenuOpen) => set({ sideMenuOpen }),
    authModal: "none",
    setAuthModal: (authModal) => set({ authModal }),
    artistView: null,
    setArtistView: (id) => set({ artistView: id }),
    pesapalModal: false,
    setPesapalModal: (pesapalModal) => set({ pesapalModal }),
  };
});
