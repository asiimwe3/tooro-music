// ============================================================
// TOORO MUSIC - Player Store (Zustand)
// ============================================================

import { create } from 'zustand';
import { Song, PlayerState } from '../types';
import { songsApi } from '../api/songs';
import { useAuthStore } from './authStore';
import TrackPlayer, {
  Capability,
  Event,
  RepeatMode,
  State,
  useTrackPlayerEvents,
} from 'react-native-track-player';

interface PlayerStore extends PlayerState {
  // Actions
  initPlayer: () => Promise<void>;
  playSong: (song: Song, queue?: Song[]) => Promise<void>;
  playQueue: (songs: Song[], startIndex?: number) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  nextSong: () => Promise<void>;
  previousSong: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  setIsPlaying: (playing: boolean) => void;
  showMiniPlayer: () => void;
  hideMiniPlayer: () => void;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  // State
  currentSong: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  isLoading: false,
  position: 0,
  duration: 0,
  repeatMode: 'off',
  shuffleEnabled: false,
  volume: 1,
  miniPlayerVisible: false,

  initPlayer: async () => {
    try {
      await TrackPlayer.setupPlayer({
        maxCacheSize: 1024 * 5, // 5MB
      });

      await TrackPlayer.updateOptions({
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
          Capability.Stop,
        ],
        compactCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
        ],
        notificationCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
        ],
      });
    } catch (error) {
      console.log('Player already initialized');
    }
  },

  playSong: async (song: Song, queue?: Song[]) => {
    set({ isLoading: true });
    
    try {
      const playQueue = queue || [song];
      const songIndex = playQueue.findIndex(s => s.id === song.id);

      await TrackPlayer.reset();
      
      const tracks = playQueue.map(s => ({
        id: s.id,
        url: s.audio_url,
        title: s.title,
        artist: s.artist?.name || 'Unknown Artist',
        artwork: s.cover_url,
        duration: s.duration,
      }));
      
      await TrackPlayer.add(tracks);
      await TrackPlayer.skip(songIndex);
      await TrackPlayer.play();

      set({
        currentSong: song,
        queue: playQueue,
        queueIndex: songIndex,
        isPlaying: true,
        isLoading: false,
        miniPlayerVisible: true,
        duration: song.duration,
      });

      // Record play analytics
      const user = useAuthStore.getState().user;
      songsApi.recordPlay(song.id, user?.id);
      
    } catch (error) {
      console.error('Error playing song:', error);
      set({ isLoading: false });
    }
  },

  playQueue: async (songs: Song[], startIndex = 0) => {
    if (songs.length === 0) return;
    await get().playSong(songs[startIndex], songs);
  },

  togglePlayPause: async () => {
    const { isPlaying } = get();
    if (isPlaying) {
      await TrackPlayer.pause();
      set({ isPlaying: false });
    } else {
      await TrackPlayer.play();
      set({ isPlaying: true });
    }
  },

  nextSong: async () => {
    const { queue, queueIndex } = get();
    const nextIndex = queueIndex + 1;
    
    if (nextIndex < queue.length) {
      await TrackPlayer.skipToNext();
      set({ 
        currentSong: queue[nextIndex], 
        queueIndex: nextIndex,
        position: 0,
      });
    }
  },

  previousSong: async () => {
    const { queue, queueIndex, position } = get();
    
    if (position > 3) {
      // If more than 3 seconds in, restart song
      await TrackPlayer.seekTo(0);
      set({ position: 0 });
    } else if (queueIndex > 0) {
      const prevIndex = queueIndex - 1;
      await TrackPlayer.skipToPrevious();
      set({ 
        currentSong: queue[prevIndex], 
        queueIndex: prevIndex,
        position: 0,
      });
    }
  },

  seekTo: async (position: number) => {
    await TrackPlayer.seekTo(position);
    set({ position });
  },

  setVolume: async (volume: number) => {
    await TrackPlayer.setVolume(volume);
    set({ volume });
  },

  toggleShuffle: () => {
    const { shuffleEnabled, queue } = get();
    
    if (!shuffleEnabled) {
      // Shuffle queue
      const shuffled = [...queue].sort(() => Math.random() - 0.5);
      set({ shuffleEnabled: true, queue: shuffled, queueIndex: 0 });
    } else {
      set({ shuffleEnabled: false });
    }
  },

  toggleRepeat: () => {
    const { repeatMode } = get();
    const modes: PlayerState['repeatMode'][] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    
    const trackRepeatMode = nextMode === 'one' 
      ? RepeatMode.Track 
      : nextMode === 'all' 
        ? RepeatMode.Queue 
        : RepeatMode.Off;
    
    TrackPlayer.setRepeatMode(trackRepeatMode);
    set({ repeatMode: nextMode });
  },

  addToQueue: (song: Song) => {
    const { queue } = get();
    set({ queue: [...queue, song] });
  },

  removeFromQueue: (index: number) => {
    const { queue, queueIndex } = get();
    const newQueue = queue.filter((_, i) => i !== index);
    set({ 
      queue: newQueue,
      queueIndex: index < queueIndex ? queueIndex - 1 : queueIndex,
    });
  },

  clearQueue: () => {
    set({ queue: [], queueIndex: 0, currentSong: null, miniPlayerVisible: false });
    TrackPlayer.reset();
  },

  setPosition: (position: number) => set({ position }),
  setDuration: (duration: number) => set({ duration }),
  setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
  showMiniPlayer: () => set({ miniPlayerVisible: true }),
  hideMiniPlayer: () => set({ miniPlayerVisible: false }),
}));
