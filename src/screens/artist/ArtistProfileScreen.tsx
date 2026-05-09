import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { artistsApi } from '../../api/artists';
import { usePlayerStore } from '../../store/playerStore';
import { useAuthStore } from '../../store/authStore';
import { SongCard } from '../../components/common/SongCard';
import { Artist, Song, Album } from '../../types';
import { COLORS, SPACING, RADIUS } from '../../constants';
import { formatNumber } from '../../utils/format';

const { width } = Dimensions.get('window');

export const ArtistProfileScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { playSong, playQueue } = usePlayerStore();
  const { user } = useAuthStore();
  
  const [artist, setArtist] = useState<Artist | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'songs' | 'albums' | 'about'>('songs');

  useEffect(() => {
    const loadArtist = async () => {
      if (!id) return;
      try {
        const [artistData, songsData, albumsData] = await Promise.all([
          artistsApi.getById(id),
          artistsApi.getArtistSongs(id),
          artistsApi.getArtistAlbums(id),
        ]);
        setArtist(artistData);
        setSongs(songsData);
        setAlbums(albumsData);

        if (user) {
          const following = await artistsApi.isFollowing(id, user.id);
          setIsFollowing(following);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadArtist();
  }, [id]);

  const handleFollow = async () => {
    if (!artist || !user) return;
    const nowFollowing = await artistsApi.toggleFollow(artist.id, user.id);
    setIsFollowing(nowFollowing);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.PURPLE} size="large" />
      </View>
    );
  }

  if (!artist) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: COLORS.TEXT_MUTED }}>Artist not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <Image
            source={{
              uri: artist.cover_url || artist.avatar_url || 'https://via.placeholder.com/400x300/1A1A2E/7C3AED?text=🎤',
            }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(10,10,15,0.9)', COLORS.BG_PRIMARY]}
            style={styles.heroOverlay}
          />
          
          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>

          {/* Artist info */}
          <View style={styles.heroContent}>
            <Image
              source={{
                uri: artist.avatar_url || 'https://via.placeholder.com/100x100/1A1A2E/7C3AED?text=🎤',
              }}
              style={styles.artistAvatar}
            />
            <View style={styles.artistNameRow}>
              <Text style={styles.artistName}>{artist.name}</Text>
              {artist.verified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={12} color="white" />
                </View>
              )}
            </View>
            
            {artist.genre && (
              <View style={styles.genreTags}>
                {artist.genre.slice(0, 3).map((g) => (
                  <View key={g} style={styles.genreTag}>
                    <Text style={styles.genreTagText}>{g}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Stats */}
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{formatNumber(artist.followers_count)}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{formatNumber(artist.monthly_listeners)}</Text>
                <Text style={styles.statLabel}>Monthly Listeners</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{formatNumber(artist.total_streams)}</Text>
                <Text style={styles.statLabel}>Total Streams</Text>
              </View>
            </View>

            {/* Action buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                onPress={handleFollow}
                activeOpacity={0.8}
              >
                {isFollowing ? (
                  <View style={styles.followingBtn}>
                    <Text style={styles.followingText}>Following</Text>
                  </View>
                ) : (
                  <LinearGradient
                    colors={[COLORS.PURPLE, COLORS.PURPLE_DARK]}
                    style={styles.followBtn}
                  >
                    <Text style={styles.followText}>Follow</Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>
              
              {songs.length > 0 && (
                <TouchableOpacity
                  style={styles.playAllBtn}
                  onPress={() => playQueue(songs)}
                >
                  <Ionicons name="play" size={18} color={COLORS.TEXT_PRIMARY} />
                  <Text style={styles.playAllText}>Play All</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.shareBtn}>
                <Ionicons name="share-outline" size={20} color={COLORS.TEXT_MUTED} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {(['songs', 'albums', 'about'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab content */}
        {activeTab === 'songs' && (
          <View style={styles.tabContent}>
            {songs.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🎵</Text>
                <Text style={styles.emptyText}>No songs yet</Text>
              </View>
            ) : (
              songs.map((song, index) => (
                <SongCard
                  key={song.id}
                  song={song}
                  onPress={(s) => playSong(s, songs)}
                  variant="list"
                  index={index}
                  showArtist={false}
                  showStreams
                />
              ))
            )}
          </View>
        )}

        {activeTab === 'albums' && (
          <View style={[styles.tabContent, styles.albumsGrid]}>
            {albums.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>💿</Text>
                <Text style={styles.emptyText}>No albums yet</Text>
              </View>
            ) : (
              albums.map((album) => (
                <TouchableOpacity
                  key={album.id}
                  style={styles.albumCard}
                  onPress={() => router.push(`/album/${album.id}`)}
                >
                  <Image
                    source={{ uri: album.cover_url || 'https://via.placeholder.com/150x150/1A1A2E/7C3AED?text=💿' }}
                    style={styles.albumArtwork}
                  />
                  <Text style={styles.albumTitle} numberOfLines={2}>{album.title}</Text>
                  <Text style={styles.albumYear}>
                    {new Date(album.release_date).getFullYear()} · {album.songs_count} songs
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {activeTab === 'about' && (
          <View style={styles.tabContent}>
            <Text style={styles.bio}>{artist.bio || 'No biography available.'}</Text>
            
            {artist.social_links && (
              <View style={styles.socialLinks}>
                <Text style={styles.socialTitle}>Follow on Social</Text>
                <View style={styles.socialRow}>
                  {artist.social_links.instagram && (
                    <View style={styles.socialChip}>
                      <Text style={styles.socialText}>Instagram</Text>
                    </View>
                  )}
                  {artist.social_links.twitter && (
                    <View style={styles.socialChip}>
                      <Text style={styles.socialText}>Twitter/X</Text>
                    </View>
                  )}
                  {artist.social_links.facebook && (
                    <View style={styles.socialChip}>
                      <Text style={styles.socialText}>Facebook</Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_PRIMARY,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.BG_PRIMARY,
  },
  hero: {
    height: 380,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 56,
    left: SPACING.XL,
    width: 40,
    height: 40,
    borderRadius: RADIUS.FULL,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.XL,
    alignItems: 'center',
  },
  artistAvatar: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.FULL,
    borderWidth: 3,
    borderColor: COLORS.PURPLE,
    marginBottom: SPACING.MD,
  },
  artistNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
    marginBottom: SPACING.SM,
  },
  artistName: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: '800',
  },
  verifiedBadge: {
    backgroundColor: COLORS.PURPLE,
    borderRadius: RADIUS.FULL,
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genreTags: {
    flexDirection: 'row',
    gap: SPACING.SM,
    marginBottom: SPACING.LG,
  },
  genreTag: {
    backgroundColor: 'rgba(124,58,237,0.3)',
    borderRadius: RADIUS.FULL,
    paddingHorizontal: SPACING.MD,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.PURPLE,
  },
  genreTagText: {
    color: COLORS.PURPLE_LIGHT,
    fontSize: 11,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.XL,
    marginBottom: SPACING.XL,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: COLORS.TEXT_MUTED,
    fontSize: 11,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.BORDER,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.MD,
    alignItems: 'center',
  },
  followBtn: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: RADIUS.FULL,
  },
  followText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  followingBtn: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: RADIUS.FULL,
    borderWidth: 1.5,
    borderColor: COLORS.PURPLE,
  },
  followingText: {
    color: COLORS.PURPLE_LIGHT,
    fontSize: 14,
    fontWeight: '700',
  },
  playAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.LG,
    paddingVertical: 12,
    borderRadius: RADIUS.FULL,
    backgroundColor: COLORS.BG_ELEVATED,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  playAllText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  shareBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.FULL,
    backgroundColor: COLORS.BG_ELEVATED,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.XL,
    gap: SPACING.SM,
    marginBottom: SPACING.LG,
  },
  tab: {
    paddingHorizontal: SPACING.XL,
    paddingVertical: SPACING.MD,
    borderRadius: RADIUS.FULL,
    backgroundColor: COLORS.BG_CARD,
  },
  tabActive: {
    backgroundColor: COLORS.PURPLE,
  },
  tabText: {
    color: COLORS.TEXT_MUTED,
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: 'white',
  },
  tabContent: {
    paddingBottom: SPACING.XL,
  },
  albumsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.XL,
    gap: SPACING.LG,
  },
  albumCard: {
    width: (width - SPACING.XL * 2 - SPACING.LG) / 2,
  },
  albumArtwork: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: RADIUS.LG,
    marginBottom: SPACING.SM,
    backgroundColor: COLORS.BG_SURFACE,
  },
  albumTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 13,
    fontWeight: '600',
  },
  albumYear: {
    color: COLORS.TEXT_MUTED,
    fontSize: 11,
    marginTop: 2,
  },
  bio: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 15,
    lineHeight: 24,
    paddingHorizontal: SPACING.XL,
    marginBottom: SPACING.XL,
  },
  socialLinks: {
    paddingHorizontal: SPACING.XL,
  },
  socialTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: SPACING.MD,
  },
  socialRow: {
    flexDirection: 'row',
    gap: SPACING.SM,
  },
  socialChip: {
    backgroundColor: COLORS.BG_CARD,
    borderRadius: RADIUS.FULL,
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  socialText: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.MD,
  },
  emptyText: {
    color: COLORS.TEXT_MUTED,
    fontSize: 15,
  },
});
