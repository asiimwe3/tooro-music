import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Artist } from '../../types';
import { COLORS, RADIUS, SPACING } from '../../constants';
import { formatNumber } from '../../utils/format';

interface Props {
  artist: Artist;
  onPress: (artist: Artist) => void;
  variant?: 'circle' | 'card';
}

export const ArtistCard: React.FC<Props> = ({
  artist,
  onPress,
  variant = 'circle',
}) => {
  if (variant === 'card') {
    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => onPress(artist)}
        activeOpacity={0.7}
      >
        <Image
          source={{
            uri: artist.avatar_url || 'https://via.placeholder.com/200x200/1A1A2E/7C3AED?text=🎤',
          }}
          style={styles.cardImage}
        />
        <View style={styles.cardOverlay} />
        <View style={styles.cardContent}>
          <View style={styles.nameRow}>
            <Text style={styles.cardName} numberOfLines={1}>
              {artist.name}
            </Text>
            {artist.verified && (
              <Ionicons name="checkmark-circle" size={16} color={COLORS.PURPLE} />
            )}
          </View>
          <Text style={styles.cardListeners}>
            {formatNumber(artist.monthly_listeners)} monthly listeners
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.circleContainer}
      onPress={() => onPress(artist)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarWrapper}>
        <Image
          source={{
            uri: artist.avatar_url || 'https://via.placeholder.com/80x80/1A1A2E/7C3AED?text=🎤',
          }}
          style={styles.avatar}
        />
        {artist.verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark" size={10} color={COLORS.TEXT_PRIMARY} />
          </View>
        )}
      </View>
      <Text style={styles.circleName} numberOfLines={1}>
        {artist.name}
      </Text>
      <Text style={styles.circleFollowers}>
        {formatNumber(artist.followers_count)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Circle variant
  circleContainer: {
    alignItems: 'center',
    width: 80,
    marginRight: SPACING.LG,
  },
  avatarWrapper: {
    position: 'relative',
    width: 72,
    height: 72,
    marginBottom: SPACING.SM,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.FULL,
    borderWidth: 2,
    borderColor: COLORS.PURPLE,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.PURPLE,
    borderRadius: RADIUS.FULL,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.BG_PRIMARY,
  },
  circleName: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  circleFollowers: {
    color: COLORS.TEXT_MUTED,
    fontSize: 10,
    textAlign: 'center',
  },

  // Card variant
  cardContainer: {
    width: 200,
    height: 120,
    borderRadius: RADIUS.LG,
    overflow: 'hidden',
    marginRight: SPACING.MD,
    backgroundColor: COLORS.BG_SURFACE,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  cardContent: {
    position: 'absolute',
    bottom: SPACING.MD,
    left: SPACING.MD,
    right: SPACING.MD,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardName: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  cardListeners: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 11,
    marginTop: 2,
  },
});
