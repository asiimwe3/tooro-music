import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS } from '../../constants';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '🎵',
    title: 'Discover African Music',
    subtitle: 'Explore the best of Afrobeat, Amapiano, Gospel, and traditional Ugandan sounds',
    gradient: [COLORS.PURPLE, COLORS.PURPLE_DARK],
  },
  {
    id: '2',
    emoji: '🏆',
    title: 'Tooro Charts',
    subtitle: 'Follow the top songs from Western Uganda and support your favorite local artists',
    gradient: [COLORS.GOLD_DARK, '#92400E'],
  },
  {
    id: '3',
    emoji: '🎤',
    title: 'Upload & Share',
    subtitle: 'Artists can upload music, build a fanbase, and track their analytics',
    gradient: ['#059669', '#065F46'],
  },
  {
    id: '4',
    emoji: '🎧',
    title: 'Listen Anywhere',
    subtitle: 'Premium offline listening, high-quality audio, and background playback',
    gradient: ['#2563EB', '#1E3A8A'],
  },
];

export const OnboardingScreen: React.FC = () => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => {
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item, index }) => (
          <View style={styles.slide}>
            <LinearGradient
              colors={[COLORS.BG_PRIMARY, '#1A0A2E']}
              style={styles.slideGradient}
            >
              <View style={styles.slideContent}>
                {/* Emoji circle */}
                <LinearGradient
                  colors={item.gradient as any}
                  style={styles.emojiContainer}
                >
                  <Text style={styles.emoji}>{item.emoji}</Text>
                </LinearGradient>
                
                <Text style={styles.slideTitle}>{item.title}</Text>
                <Text style={styles.slideSubtitle}>{item.subtitle}</Text>
              </View>
            </LinearGradient>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      {/* Bottom controls */}
      <View style={styles.footer}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, index) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ],
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const dotOpacity = scrollX.interpolate({
              inputRange: [
                (index - 1) * width,
                index * width,
                (index + 1) * width,
              ],
              outputRange: [0.4, 1, 0.4],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  { width: dotWidth, opacity: dotOpacity },
                ]}
              />
            );
          })}
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          {currentIndex < SLIDES.length - 1 && (
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity onPress={handleNext} activeOpacity={0.8}>
            <LinearGradient
              colors={[COLORS.PURPLE, COLORS.PURPLE_DARK]}
              style={[
                styles.nextButton,
                currentIndex === SLIDES.length - 1 && styles.getStartedButton,
              ]}
            >
              <Text style={styles.nextText}>
                {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BG_PRIMARY,
  },
  slide: {
    width,
  },
  slideGradient: {
    width: '100%',
    height: height - 180,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING['3XL'],
  },
  slideContent: {
    alignItems: 'center',
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    shadowColor: COLORS.PURPLE,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
  },
  emoji: {
    fontSize: 56,
  },
  slideTitle: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  slideSubtitle: {
    color: COLORS.TEXT_SECONDARY,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING['2XL'],
    paddingBottom: 40,
    paddingTop: SPACING.XL,
    backgroundColor: 'rgba(10,10,15,0.95)',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.XL,
    gap: SPACING.SM,
  },
  dot: {
    height: 8,
    borderRadius: RADIUS.FULL,
    backgroundColor: COLORS.PURPLE,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: SPACING.MD,
    paddingHorizontal: SPACING.LG,
  },
  skipText: {
    color: COLORS.TEXT_MUTED,
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: RADIUS.FULL,
  },
  getStartedButton: {
    paddingHorizontal: 48,
  },
  nextText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '700',
  },
});
