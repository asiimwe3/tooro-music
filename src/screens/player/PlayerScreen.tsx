import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { usePlayerStore } from '../../store/playerStore';
import { useAuthStore } from '../../store/authStore';
import { songsApi } from '../../api/songs';
import { COLORS, SPACING, RADIUS } from '../../constants';
import { formatDuration } from '../../utils/format';
import { useProgress } from 'react-native-track-player';

const { width, height } = Dimensions.get('window');

export const PlayerScreen: React.FC = () => {
  const router = useRouter();
  const {
    currentSong,
    isPlaying,
    repeatMode,
    shuffleEnabled,
    queue,
    queueIndex,
    togglePlayPause,
    nextSong,
    previousSong,
    seekTo,
    toggleShuffle,
    toggleRepeat,
    addToQueue,
  } = usePlayerStore();
  
  const { user } = useAuthStore();
  const { position, duration } = useProgress();
  
  const [isLiked, setIsLiked] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  
  const artworkScale = useRef(new Animated.Value(0.9)).current;
  const heartAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isPlaying) {
      Animated.spring(artworkScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.spring(artworkScale, {
        toValue: 0.88,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    }
  }, [isPlaying]);

  useEffect(() => {
    const checkLike = async () => {
      if (currentSong && user) {
        const liked = await songsApi.isLiked(currentSong.id, user.id);
        setIsLiked(liked);
      }
    };
    checkLike();
  }, [currentSong?.id]);

  const handleLike = async () => {
    if (!currentSong || !user) return;
    
    // Animate heart
    Animated.sequence([
      Animated.spring(heartAnim, { toValue: 1.4, useNativeDriver: true }),
      Animated.spring(heartAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
    
    const newLiked = await songsApi.toggleLike(currentSong.id, user.id);
    setIsLiked(newLiked);
  };

  if (!currentSong) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No song playing</Text>
      </View>
    );
  }

  const repeatIcon = repeatMode === 'one' ? 'repeat-sharp' : 'repeat';
  const repeatColor = repeatMode !== 'off' ? COLORS.PURPLE : COLORS.TEXT_MUTED;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Background artwork blur */}
      <Image
        source={{ uri: currentSong.cover_url }}
        style={styles.bgImage}
        blurRadius={40}
      />
      <View style={styles.bgOverlay} />
      
      <LinearGradient
        colors={['rgba(10,10,15,0.3)', 'rgba(10,10,15,0.95)']}
        style={styles.gradient}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          bounces={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-down" size={28} color={COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerLabel}>Now Playing</Text>
              <Text style={styles.headerPlaylist} numberOfLines={1}>
                {queue.length > 1 ? `${queueIndex + 1} of ${queue.length}` : 'Single'}
              </Text>
            </View>
            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="ellipsis-horizontal" size={24} color={COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>

          {/* Artwork */}
          <View style={styles.artworkWrapper}>
            <Animated.View
              style={[
                styles.artworkContainer,
                { transform: [{ scale: artworkScale }] },
              ]}
            >
              <Image
                source={{
                  uri: currentSong.cover_url || 'https://via.placeholder.com/300x300/1A1A2E/7C3AED?text=🎵',
                }}
                style={styles.artwork}
              />
              {/* Glow effect */}
              <View style={styles.artworkGlow} />
            </Animated.View>
          </View>

          {/* Song info */}
          <View style={styles.songInfo}>
            <View style={styles.songInfoLeft}>
              <Text style={styles.songTitle} numberOfLines={1}>
                {currentSong.title}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  router.push(`/artist/${currentSong.artist_id}`);
                }}
              >
                <Text style={styles.artistName} numberOfLines={1}>
                  {currentSong.artist?.name}
                  {currentSong.artist?.verified && (
                    <Text style={{ color: COLORS.PURPLE }}> ✓</Text>
                  )}
                </Text>
              </TouchableOpacity>
            </View>
            <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
              <TouchableOpacity onPress={handleLike}>
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={28}
                  color={isLiked ? '#EF4444' : COLORS.TEXT_MUTED}
                />
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration || 1}
              value={position}
              onSlidingComplete={seekTo}
              minimumTrackTintColor={COLORS.PURPLE}
              maximumTrackTintColor={COLORS.BORDER}
              thumbTintColor={COLORS.TEXT_PRIMARY}
            />
            <View style={styles.timeRow}>
              <Text style={styles.time}>{formatDuration(position)}</Text>
              <Text style={styles.time}>{formatDuration(duration)}</Text>
            </View>
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            {/* Shuffle */}
            <TouchableOpacity onPress={toggleShuffle}>
              <Ionicons
                name="shuffle"
                size={24}
                color={shuffleEnabled ? COLORS.PURPLE : COLORS.TEXT_MUTED}
              />
            </TouchableOpacity>

            {/* Previous */}
            <TouchableOpacity onPress={previousSong} style={styles.controlBtn}>
              <Ionicons name="play-skip-back" size={32} color={COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>

            {/* Play/Pause */}
            <TouchableOpacity
              onPress={togglePlayPause}
              style={styles.playButton}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.PURPLE, COLORS.PURPLE_DARK]}
                style={styles.playButtonGradient}
              >
                <Ionicons
                  name={isPlaying ? 'pause' : 'play'}
                  size={34}
                  color="white"
                />
              </LinearGradient>
            </TouchableOpacity>

            {/* Next */}
            <TouchableOpacity onPress={nextSong} style={styles.controlBtn}>
              <Ionicons name="play-skip-forward" size={32} color={COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>

            {/* Repeat */}
            <TouchableOpacity onPress={toggleRepeat}>
              <View style={{ position: 'relative' }}>
                <Ionicons
                  name={repeatIcon}
                  size={24}
                  color={repeatColor}
                />
                {repeatMode === 'one' && (
                  <View style={styles.repeatOneDot} />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Extra controls */}
          <View style={styles.extraControls}>
            <TouchableOpacity
              style={[styles.extraBtn, showLyrics && styles.extraBtnActive]}
              onPress={() => { setShowLyrics(!showLyrics); setShowQueue(false); }}
            >
              <Ionicons
                name="text"
                size={18}
                color={showLyrics ? COLORS.PURPLE : COLORS.TEXT_MUTED}
              />
              <Text style={[styles.extraBtnText, showLyrics && { color: COLORS.PURPLE }]}>
                Lyrics
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.extraBtn, showQueue && styles.extraBtnActive]}
              onPress={() => { setShowQueue(!showQueue); setShowLyrics(false); }}
            >
              <Ionicons
                name="list"
                size={18}
                color={showQueue ? COLORS.PURPLE : COLORS.TEXT_MUTED}
              />
              <Text style={[styles.extraBtnText, showQueue && { color: COLORS.PURPLE }]}>
                Queue
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.extraBtn}>
              <Ionicons name="share-outline" size={18} color={COLORS.TEXT_MUTED} />
              <Text style={styles.extraBtnText}>Share</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.extraBtn}>
              <Ionicons name="download-outline" size={18} color={COLORS.TEXT_MUTED} />
              <Text style={styles.extraBtnText}>Save</Text>
            </TouchableOpacity>
          </View>

          {/* Lyrics panel */}
          {showLyrics && currentSong.lyrics && (
            <BlurView intensity={20} style={styles.lyricsPanel}>
              <Text style={styles.lyricsPanelTitle}>Lyrics</Text>
              <ScrollView>
                <Text style={styles.lyricsText}>{currentSong.lyrics}</Text>
              </ScrollView>
            </BlurView>
          )}

          {/* Queue panel */}
          {showQueue && queue.length > 0 && (
            <View style={styles.queuePanel}>
              <Text style={styles.queueTitle}>Up Next</Text>
              {queue.slice(queueIndex + 1, queueIndex + 6).map((song, i) => (
                <View key={song.id} style={styles.queueItem}>
                  <Image
                    source={{ uri: song.cover_url }}
                    style={styles.queueArtwork}
                  />
                  <View style={styles.queueInfo}>
                    <Text style={styles.queueSongTitle} numberOfLines={1}>
                      {song.title}
                    </Text>
                    <Text style={styles.queueArtist} numberOfLines={1}>
                      {song.artist?.name}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_PRIMARY,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.BG_PRIMARY,
  },
  emptyText: {
    color: COLORS.TEXT_MUTED,
    fontSize: 16,
  },
  bgImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.4,
  },
  bgOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(10,10,15,0.6)',
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.XL,
    paddingTop: 56,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerLabel: {
    color: COLORS.TEXT_MUTED,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerPlaylist: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },

  // Artwork
  artworkWrapper: {
    alignItems: 'center',
    marginBottom: 36,
  },
  artworkContainer: {
    width: width - 80,
    height: width - 80,
    borderRadius: RADIUS['2XL'],
    overflow: 'hidden',
    shadowColor: COLORS.PURPLE,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 24,
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  artworkGlow: {
    position: 'absolute',
    bottom: -20,
    left: '10%',
    right: '10%',
    height: 40,
    backgroundColor: COLORS.PURPLE,
    opacity: 0.3,
    borderRadius: RADIUS.FULL,
    filter: 'blur(20px)' as any,
  },

  // Song info
  songInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  songInfoLeft: {
    flex: 1,
    marginRight: SPACING.LG,
  },
  songTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  artistName: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 15,
  },

  // Progress
  progressContainer: {
    marginBottom: 24,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: -8,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    color: COLORS.TEXT_MUTED,
    fontSize: 12,
  },

  // Controls
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
    paddingHorizontal: SPACING.SM,
  },
  controlBtn: {
    padding: SPACING.SM,
  },
  playButton: {
    shadowColor: COLORS.PURPLE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  playButtonGradient: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.FULL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatOneDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.PURPLE,
  },

  // Extra controls
  extraControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  extraBtn: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
    borderRadius: RADIUS.MD,
  },
  extraBtnActive: {
    backgroundColor: 'rgba(124,58,237,0.15)',
  },
  extraBtnText: {
    color: COLORS.TEXT_MUTED,
    fontSize: 11,
  },

  // Lyrics panel
  lyricsPanel: {
    borderRadius: RADIUS.XL,
    padding: SPACING.XL,
    marginBottom: SPACING.XL,
    maxHeight: 200,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  lyricsPanelTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: SPACING.MD,
  },
  lyricsText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 15,
    lineHeight: 26,
  },

  // Queue panel
  queuePanel: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: RADIUS.XL,
    padding: SPACING.XL,
    marginBottom: SPACING.XL,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  queueTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: SPACING.LG,
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.MD,
    gap: SPACING.MD,
  },
  queueArtwork: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.SM,
  },
  queueInfo: {
    flex: 1,
  },
  queueSongTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 13,
    fontWeight: '600',
  },
  queueArtist: {
    color: COLORS.TEXT_MUTED,
    fontSize: 12,
  },
});
