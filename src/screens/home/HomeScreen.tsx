import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { usePlayerStore } from '../../store/playerStore';
import { songsApi } from '../../api/songs';
import { artistsApi } from '../../api/artists';
import { SongCard } from '../../components/common/SongCard';
import { ArtistCard } from '../../components/common/ArtistCard';
import { COLORS, SPACING, RADIUS, GENRES, GENRE_COLORS } from '../../constants';
import { Song, Artist } from '../../types';
import { formatNumber } from '../../utils/format';

const { width } = Dimensions.get('window');

export const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const { playSong } = usePlayerStore();
  
  const [trending, setTrending] = useState<Song[]>([]);
  const [newReleases, setNewReleases] = useState<Song[]>([]);
  const [featured, setFeatured] = useState<Artist[]>([]);
  const [tooroCharts, setTooroCharts] = useState<Song[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [trendingData, newReleasesData, featuredData, chartsData] = await Promise.all([
        songsApi.getTrending(8),
        songsApi.getNewReleases(8),
        artistsApi.getFeatured(6),
        songsApi.getTooroCharts(5),
      ]);
      
      setTrending(trendingData);
      setNewReleases(newReleasesData);
      setFeatured(featuredData);
      setTooroCharts(chartsData);

      if (user) {
        const recentData = await songsApi.getRecentlyPlayed(user.id, 8);
        setRecentlyPlayed(recentData);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSongPress = (song: Song, queue?: Song[]) => {
    playSong(song, queue);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[COLORS.BG_PRIMARY, '#1A0A2E', COLORS.BG_PRIMARY]}
        style={styles.gradient}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.PURPLE}
            />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>
                {user?.full_name?.split(' ')[0] || 'Music Lover'} 👋
              </Text>
            </View>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.notifButton}
                onPress={() => router.push('/notifications')}
              >
                <Ionicons name="notifications-outline" size={24} color={COLORS.TEXT_PRIMARY} />
                <View style={styles.notifDot} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/profile')}
              >
                {user?.avatar_url ? (
                  <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {(user?.full_name || 'U')[0].toUpperCase()}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Featured Banner */}
          {trending[0] && (
            <TouchableOpacity
              style={styles.banner}
              onPress={() => handleSongPress(trending[0], trending)}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: trending[0].cover_url || 'https://via.placeholder.com/400x200/1A1A2E/7C3AED?text=🎵' }}
                style={styles.bannerImage}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.85)']}
                style={styles.bannerOverlay}
              >
                <View style={styles.bannerBadge}>
                  <Text style={styles.bannerBadgeText}>🔥 Trending #1</Text>
                </View>
                <Text style={styles.bannerTitle}>{trending[0].title}</Text>
                <Text style={styles.bannerArtist}>{trending[0].artist?.name}</Text>
                <View style={styles.bannerStats}>
                  <Ionicons name="headset" size={14} color={COLORS.TEXT_SECONDARY} />
                  <Text style={styles.bannerStreams}>
                    {formatNumber(trending[0].streams_count)} streams
                  </Text>
                </View>
              </LinearGradient>
              <View style={styles.bannerPlayBtn}>
                <Ionicons name="play" size={20} color="white" />
              </View>
            </TouchableOpacity>
          )}

          {/* Genre Quick Access */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.genreScrollContent}
            style={styles.genreScroll}
          >
            {GENRES.slice(0, 8).map((genre) => (
              <TouchableOpacity
                key={genre}
                onPress={() => router.push(`/discover?genre=${genre}`)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={(GENRE_COLORS[genre] || [COLORS.PURPLE, COLORS.PURPLE_DARK]) as any}
                  style={styles.genreChip}
                >
                  <Text style={styles.genreChipText}>{genre}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Recently Played */}
          {recentlyPlayed.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recently Played</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAll}>See all</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                horizontal
                data={recentlyPlayed}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <SongCard
                    song={item}
                    onPress={(song) => handleSongPress(song, recentlyPlayed)}
                    variant="vertical"
                  />
                )}
              />
            </View>
          )}

          {/* Trending Songs */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🔥 Trending Now</Text>
              <TouchableOpacity onPress={() => router.push('/discover?filter=trending')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={trending}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <SongCard
                  song={item}
                  onPress={(song) => handleSongPress(song, trending)}
                  variant="vertical"
                />
              )}
            />
          </View>

          {/* Tooro Charts */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🏆 Tooro Charts</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.chartContainer}>
              {tooroCharts.map((song, index) => (
                <SongCard
                  key={song.id}
                  song={song}
                  onPress={(s) => handleSongPress(s, tooroCharts)}
                  variant="list"
                  index={index}
                  showStreams
                />
              ))}
            </View>
          </View>

          {/* Featured Artists */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⭐ Featured Artists</Text>
              <TouchableOpacity onPress={() => router.push('/discover?filter=artists')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={featured}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ArtistCard
                  artist={item}
                  onPress={(a) => router.push(`/artist/${a.id}`)}
                  variant="circle"
                />
              )}
            />
          </View>

          {/* New Releases */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>✨ New Releases</Text>
              <TouchableOpacity onPress={() => router.push('/discover?filter=new')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              data={newReleases}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <SongCard
                  song={item}
                  onPress={(song) => handleSongPress(song, newReleases)}
                  variant="horizontal"
                />
              )}
            />
          </View>

          {/* Bottom padding for mini player */}
          <View style={{ height: 100 }} />
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
  gradient: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 56,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.XL,
    marginBottom: SPACING.XL,
  },
  greeting: {
    color: COLORS.TEXT_MUTED,
    fontSize: 14,
  },
  userName: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.MD,
  },
  notifButton: {
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: RADIUS.FULL,
    backgroundColor: COLORS.GOLD,
    borderWidth: 1.5,
    borderColor: COLORS.BG_PRIMARY,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.FULL,
    borderWidth: 2,
    borderColor: COLORS.PURPLE,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.FULL,
    backgroundColor: COLORS.PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.PURPLE_DARK,
  },
  avatarText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },

  // Banner
  banner: {
    marginHorizontal: SPACING.XL,
    height: 200,
    borderRadius: RADIUS.XL,
    overflow: 'hidden',
    marginBottom: SPACING.XL,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    justifyContent: 'flex-end',
    padding: SPACING.LG,
  },
  bannerBadge: {
    backgroundColor: 'rgba(124,58,237,0.9)',
    borderRadius: RADIUS.FULL,
    paddingHorizontal: SPACING.MD,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: SPACING.SM,
  },
  bannerBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  bannerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '800',
  },
  bannerArtist: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 14,
    marginTop: 2,
  },
  bannerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  bannerStreams: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 12,
  },
  bannerPlayBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: RADIUS.FULL,
    backgroundColor: 'rgba(124,58,237,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Genre chips
  genreScroll: {
    marginBottom: SPACING.XL,
  },
  genreScrollContent: {
    paddingHorizontal: SPACING.XL,
    gap: SPACING.SM,
  },
  genreChip: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
    borderRadius: RADIUS.FULL,
  },
  genreChipText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },

  // Sections
  section: {
    marginBottom: SPACING['2XL'],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.XL,
    marginBottom: SPACING.LG,
  },
  sectionTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '700',
  },
  seeAll: {
    color: COLORS.PURPLE_LIGHT,
    fontSize: 13,
    fontWeight: '600',
  },
  horizontalList: {
    paddingHorizontal: SPACING.XL,
  },
  chartContainer: {
    backgroundColor: COLORS.BG_CARD,
    marginHorizontal: SPACING.XL,
    borderRadius: RADIUS.XL,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
});
