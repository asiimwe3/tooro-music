import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { songsApi } from '../../api/songs';
import { SongCard } from '../../components/common/SongCard';
import { ArtistCard } from '../../components/common/ArtistCard';
import { usePlayerStore } from '../../store/playerStore';
import { COLORS, SPACING, RADIUS, GENRES, GENRE_COLORS } from '../../constants';
import { SearchResult, Song } from '../../types';

export const DiscoverScreen: React.FC = () => {
  const router = useRouter();
  const { playSong } = usePlayerStore();
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'songs' | 'artists' | 'albums' | 'playlists'>('all');
  
  const searchTimeout = React.useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    if (!text.trim()) {
      setResults(null);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const data = await songsApi.search(text);
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 400);
  }, []);

  const hasResults = results && (
    results.songs.length > 0 ||
    results.artists.length > 0 ||
    results.albums.length > 0
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[COLORS.BG_PRIMARY, '#1A0A2E', COLORS.BG_PRIMARY]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>Find your next favorite</Text>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.TEXT_MUTED} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search songs, artists, albums..."
            placeholderTextColor={COLORS.TEXT_MUTED}
            value={query}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.TEXT_MUTED} />
            </TouchableOpacity>
          )}
        </View>

        {/* Search tabs (shown when searching) */}
        {query.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContent}
            style={styles.tabs}
          >
            {(['all', 'songs', 'artists', 'albums'] as const).map((tab) => (
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
          </ScrollView>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* Loading */}
          {isSearching && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={COLORS.PURPLE} size="large" />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          )}

          {/* Search results */}
          {!isSearching && hasResults && (
            <View>
              {/* Songs */}
              {(activeTab === 'all' || activeTab === 'songs') && results.songs.length > 0 && (
                <View style={styles.resultSection}>
                  <Text style={styles.resultTitle}>Songs</Text>
                  {results.songs.map((song) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      onPress={(s) => playSong(s, results.songs)}
                      variant="list"
                    />
                  ))}
                </View>
              )}

              {/* Artists */}
              {(activeTab === 'all' || activeTab === 'artists') && results.artists.length > 0 && (
                <View style={styles.resultSection}>
                  <Text style={styles.resultTitle}>Artists</Text>
                  <FlatList
                    horizontal
                    data={results.artists}
                    showsHorizontalScrollIndicator={false}
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
              )}

              {/* Albums */}
              {(activeTab === 'all' || activeTab === 'albums') && results.albums.length > 0 && (
                <View style={styles.resultSection}>
                  <Text style={styles.resultTitle}>Albums</Text>
                  <FlatList
                    horizontal
                    data={results.albums}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.albumCard}
                        onPress={() => router.push(`/album/${item.id}`)}
                      >
                        <Text style={styles.albumTitle}>{item.title}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              )}
            </View>
          )}

          {/* No results */}
          {!isSearching && query.length > 0 && !hasResults && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptySubtitle}>
                Try searching for something different
              </Text>
            </View>
          )}

          {/* Browse by genre (shown when not searching) */}
          {!query.length && (
            <View>
              <Text style={styles.browseTitle}>Browse by Genre</Text>
              <View style={styles.genreGrid}>
                {GENRES.map((genre) => (
                  <TouchableOpacity
                    key={genre}
                    style={styles.genreCard}
                    onPress={() => router.push(`/discover/genre/${genre}`)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={(GENRE_COLORS[genre] || [COLORS.PURPLE, COLORS.PURPLE_DARK]) as any}
                      style={styles.genreCardGradient}
                    >
                      <Text style={styles.genreName}>{genre}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

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
  header: {
    paddingHorizontal: SPACING.XL,
    paddingTop: 56,
    marginBottom: SPACING.XL,
  },
  title: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.TEXT_MUTED,
    fontSize: 14,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BG_CARD,
    marginHorizontal: SPACING.XL,
    borderRadius: RADIUS.LG,
    paddingHorizontal: SPACING.LG,
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    marginBottom: SPACING.LG,
    gap: SPACING.MD,
  },
  searchIcon: {
    // already positioned via gap
  },
  searchInput: {
    flex: 1,
    color: COLORS.TEXT_PRIMARY,
    fontSize: 15,
  },
  tabs: {
    marginBottom: SPACING.LG,
  },
  tabsContent: {
    paddingHorizontal: SPACING.XL,
    gap: SPACING.SM,
  },
  tab: {
    paddingHorizontal: SPACING.LG,
    paddingVertical: SPACING.SM,
    borderRadius: RADIUS.FULL,
    backgroundColor: COLORS.BG_CARD,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  tabActive: {
    backgroundColor: COLORS.PURPLE,
    borderColor: COLORS.PURPLE,
  },
  tabText: {
    color: COLORS.TEXT_MUTED,
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: 'white',
  },
  content: {
    paddingHorizontal: SPACING.XL,
    paddingBottom: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: SPACING.LG,
  },
  loadingText: {
    color: COLORS.TEXT_MUTED,
    fontSize: 14,
  },
  resultSection: {
    marginBottom: SPACING.XL,
  },
  resultTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: SPACING.MD,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.LG,
  },
  emptyTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: SPACING.SM,
  },
  emptySubtitle: {
    color: COLORS.TEXT_MUTED,
    fontSize: 14,
    textAlign: 'center',
  },
  browseTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: SPACING.LG,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.MD,
  },
  genreCard: {
    width: '47%',
    height: 70,
    borderRadius: RADIUS.LG,
    overflow: 'hidden',
  },
  genreCardGradient: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.LG,
  },
  genreName: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  albumCard: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.BG_CARD,
    borderRadius: RADIUS.LG,
    padding: SPACING.MD,
    marginRight: SPACING.MD,
    justifyContent: 'flex-end',
  },
  albumTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 12,
    fontWeight: '600',
  },
});
