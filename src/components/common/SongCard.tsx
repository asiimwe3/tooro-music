import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Song } from '../../types';
import { COLORS, RADIUS, SPACING } from '../../constants';
import { formatDuration, formatNumber } from '../../utils/format';

interface Props {
  song: Song;
  onPress: (song: Song) => void;
  onMorePress?: (song: Song) => void;
  showArtist?: boolean;
  showStreams?: boolean;
  index?: number;
  variant?: 'horizontal' | 'vertical' | 'list';
}

export const SongCard: React.FC<Props> = ({
  song,
  onPress,
  onMorePress,
  showArtist = true,
  showStreams = false,
  index,
  variant = 'vertical',
}) => {
  if (variant === 'list') {
    return (
      <TouchableOpacity
        style={styles.listContainer}
        onPress={() => onPress(song)}
        activeOpacity={0.7}
      >
        <View style={styles.listLeft}>
          {index !== undefined && (
            <Text style={styles.listIndex}>{index + 1}</Text>
          )}
          <View style={styles.listArtworkContainer}>
            <Image
              source={{
                uri: song.cover_url || 'https://via.placeholder.com/56x56/1A1A2E/7C3AED?text=🎵',
              }}
              style={styles.listArtwork}
            />
          </View>
          <View style={styles.listInfo}>
            <Text style={styles.listTitle} numberOfLines={1}>
              {song.title}
            </Text>
            {showArtist && (
              <Text style={styles.listArtist} numberOfLines={1}>
                {song.artist?.name}
                {song.artist?.verified && ' ✓'}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.listRight}>
          {showStreams && (
            <Text style={styles.streamsText}>
              {formatNumber(song.streams_count)}
            </Text>
          )}
          <Text style={styles.duration}>{formatDuration(song.duration)}</Text>
          {onMorePress && (
            <TouchableOpacity
              onPress={() => onMorePress(song)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="ellipsis-vertical" size={18} color={COLORS.TEXT_MUTED} />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === 'horizontal') {
    return (
      <TouchableOpacity
        style={styles.horizontalContainer}
        onPress={() => onPress(song)}
        activeOpacity={0.7}
      >
        <View style={styles.horizontalArtworkContainer}>
          <Image
            source={{
              uri: song.cover_url || 'https://via.placeholder.com/120x120/1A1A2E/7C3AED?text=🎵',
            }}
            style={styles.horizontalArtwork}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.horizontalGradient}
          />
          <View style={styles.playButton}>
            <Ionicons name="play" size={20} color={COLORS.TEXT_PRIMARY} />
          </View>
        </View>
        <Text style={styles.horizontalTitle} numberOfLines={2}>
          {song.title}
        </Text>
        {showArtist && (
          <Text style={styles.horizontalArtist} numberOfLines={1}>
            {song.artist?.name}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  // Default: vertical card
  return (
    <TouchableOpacity
      style={styles.verticalContainer}
      onPress={() => onPress(song)}
      activeOpacity={0.7}
    >
      <View style={styles.artworkContainer}>
        <Image
          source={{
            uri: song.cover_url || 'https://via.placeholder.com/160x160/1A1A2E/7C3AED?text=🎵',
          }}
          style={styles.artwork}
        />
        {song.is_premium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>PRO</Text>
          </View>
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {song.title}
      </Text>
      {showArtist && (
        <Text style={styles.artist} numberOfLines={1}>
          {song.artist?.name}
          {song.artist?.verified && (
            <Text style={{ color: COLORS.PURPLE }}> ✓</Text>
          )}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Vertical
  verticalContainer: {
    width: 160,
    marginRight: SPACING.MD,
  },
  artworkContainer: {
    width: 160,
    height: 160,
    borderRadius: RADIUS.LG,
    overflow: 'hidden',
    marginBottom: SPACING.SM,
    backgroundColor: COLORS.BG_SURFACE,
  },
  artwork: {
    width: '100%',
    height: '100%',
  },
  premiumBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.GOLD,
    borderRadius: RADIUS.SM,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  premiumText: {
    color: COLORS.BG_PRIMARY,
    fontSize: 10,
    fontWeight: '700',
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

  // Horizontal
  horizontalContainer: {
    width: 120,
    marginRight: SPACING.MD,
  },
  horizontalArtworkContainer: {
    width: 120,
    height: 120,
    borderRadius: RADIUS.MD,
    overflow: 'hidden',
    marginBottom: SPACING.SM,
    backgroundColor: COLORS.BG_SURFACE,
  },
  horizontalArtwork: {
    width: '100%',
    height: '100%',
  },
  horizontalGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  playButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(124,58,237,0.9)',
    borderRadius: RADIUS.FULL,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 12,
    fontWeight: '600',
  },
  horizontalArtist: {
    color: COLORS.TEXT_MUTED,
    fontSize: 11,
    marginTop: 2,
  },

  // List
  listContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  listLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listIndex: {
    color: COLORS.TEXT_MUTED,
    fontSize: 14,
    fontWeight: '600',
    width: 24,
    textAlign: 'center',
    marginRight: SPACING.MD,
  },
  listArtworkContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.SM,
    overflow: 'hidden',
    backgroundColor: COLORS.BG_SURFACE,
    marginRight: SPACING.MD,
  },
  listArtwork: {
    width: '100%',
    height: '100%',
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  listArtist: {
    color: COLORS.TEXT_MUTED,
    fontSize: 12,
    marginTop: 2,
  },
  listRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.MD,
  },
  streamsText: {
    color: COLORS.TEXT_MUTED,
    fontSize: 12,
  },
  duration: {
    color: COLORS.TEXT_MUTED,
    fontSize: 12,
  },
});
