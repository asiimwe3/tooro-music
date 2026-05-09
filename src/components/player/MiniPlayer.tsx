import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { usePlayerStore } from '../../store/playerStore';
import { COLORS, SPACING, RADIUS } from '../../constants';
import { useRouter } from 'expo-router';

export const MiniPlayer: React.FC = () => {
  const { currentSong, isPlaying, miniPlayerVisible, togglePlayPause, nextSong } = usePlayerStore();
  const router = useRouter();
  const slideAnim = React.useRef(new Animated.Value(100)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (miniPlayerVisible && currentSong) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [miniPlayerVisible, currentSong]);

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.stopAnimation();
    }
  }, [isPlaying]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!currentSong || !miniPlayerVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <BlurView intensity={80} tint="dark" style={styles.blur}>
        <View style={styles.progress} />
        
        <TouchableOpacity
          style={styles.content}
          onPress={() => router.push('/player')}
          activeOpacity={0.8}
        >
          <Animated.View
            style={[
              styles.artworkContainer,
              { transform: [{ rotate: spin }] },
            ]}
          >
            <Image
              source={{
                uri: currentSong.cover_url || 'https://via.placeholder.com/48x48/1A1A2E/7C3AED?text=🎵',
              }}
              style={styles.artwork}
            />
          </Animated.View>

          <View style={styles.info}>
            <Text style={styles.title} numberOfLines={1}>
              {currentSong.title}
            </Text>
            <Text style={styles.artist} numberOfLines={1}>
              {currentSong.artist?.name}
            </Text>
          </View>

          <View style={styles.controls}>
            <TouchableOpacity
              onPress={togglePlayPause}
              style={styles.playButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={24}
                color={COLORS.TEXT_PRIMARY}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={nextSong}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="play-skip-forward" size={22} color={COLORS.TEXT_PRIMARY} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  blur: {
    overflow: 'hidden',
  },
  progress: {
    height: 2,
    backgroundColor: COLORS.PURPLE,
    width: '35%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.MD,
    gap: SPACING.MD,
  },
  artworkContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.FULL,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.PURPLE,
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  info: {
    flex: 1,
  },
  title: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  artist: {
    color: COLORS.TEXT_MUTED,
    fontSize: 12,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.LG,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.FULL,
    backgroundColor: COLORS.PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
