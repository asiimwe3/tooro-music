import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from '../../constants';

const { width, height } = Dimensions.get('window');

interface Props {
  onFinish: () => void;
}

export const SplashScreen: React.FC<Props> = ({ onFinish }) => {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const ring1Scale = useRef(new Animated.Value(0.5)).current;
  const ring1Opacity = useRef(new Animated.Value(0)).current;
  const ring2Scale = useRef(new Animated.Value(0.5)).current;
  const ring2Opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Logo appears
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // Rings expand
      Animated.parallel([
        Animated.timing(ring1Scale, {
          toValue: 1.5,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(ring1Opacity, {
          toValue: 0.3,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(ring2Scale, {
          toValue: 2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(ring2Opacity, {
          toValue: 0.15,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // Title
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Tagline
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // Hold
      Animated.delay(800),
    ]).start(() => onFinish());
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.BG_PRIMARY, '#1A0A2E', '#0A0A0F']}
        style={styles.gradient}
      >
        <StatusBar style="light" />
        
        {/* Animated rings */}
        <Animated.View
          style={[
            styles.ring,
            {
              transform: [{ scale: ring1Scale }],
              opacity: ring1Opacity,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.ring,
            styles.ring2,
            {
              transform: [{ scale: ring2Scale }],
              opacity: ring2Opacity,
            },
          ]}
        />

        {/* Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            },
          ]}
        >
          <LinearGradient
            colors={[COLORS.PURPLE, COLORS.PURPLE_DARK]}
            style={styles.logo}
          >
            <Text style={styles.logoIcon}>🎵</Text>
          </LinearGradient>
        </Animated.View>

        {/* Title */}
        <Animated.Text style={[styles.title, { opacity: titleOpacity }]}>
          TOORO MUSIC
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          The Sound of Western Uganda
        </Animated.Text>

        {/* Gold line */}
        <Animated.View style={[styles.line, { opacity: taglineOpacity }]} />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: COLORS.PURPLE,
  },
  ring2: {
    width: 300,
    height: 300,
    borderRadius: 150,
    borderColor: COLORS.GOLD,
  },
  logoContainer: {
    marginBottom: 32,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.PURPLE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
  },
  logoIcon: {
    fontSize: 48,
  },
  title: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 4,
    marginBottom: 8,
  },
  tagline: {
    color: COLORS.GOLD,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 1,
    marginBottom: 24,
  },
  line: {
    width: 60,
    height: 3,
    backgroundColor: COLORS.GOLD,
    borderRadius: 2,
  },
});
