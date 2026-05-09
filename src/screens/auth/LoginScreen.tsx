import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { COLORS, SPACING, RADIUS } from '../../constants';

export const LoginScreen: React.FC = () => {
  const router = useRouter();
  const { signIn, signInWithGoogle, isLoading, error, clearError } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Invalid credentials');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Google login failed');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={[COLORS.BG_PRIMARY, '#1A0A2E', COLORS.BG_PRIMARY]}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[COLORS.PURPLE, COLORS.PURPLE_DARK]}
                style={styles.logo}
              >
                <Text style={styles.logoIcon}>🎵</Text>
              </LinearGradient>
            </View>
            <Text style={styles.appName}>TOORO MUSIC</Text>
            <Text style={styles.tagline}>Welcome back</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={COLORS.TEXT_MUTED} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={COLORS.TEXT_MUTED}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.TEXT_MUTED} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.TEXT_MUTED}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={COLORS.TEXT_MUTED}
                />
              </TouchableOpacity>
            </View>

            {/* Forgot password */}
            <TouchableOpacity
              style={styles.forgotButton}
              onPress={() => router.push('/(auth)/forgot-password')}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Login button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.PURPLE, COLORS.PURPLE_DARK]}
                style={styles.loginButton}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.loginButtonText}>Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google login */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleLogin}
              activeOpacity={0.7}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Phone login */}
            <TouchableOpacity
              style={styles.phoneButton}
              onPress={() => router.push('/(auth)/phone')}
              activeOpacity={0.7}
            >
              <Ionicons name="phone-portrait-outline" size={20} color={COLORS.PURPLE} />
              <Text style={styles.phoneText}>Continue with Phone</Text>
            </TouchableOpacity>
          </View>

          {/* Sign up */}
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING['2XL'],
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: 36,
  },
  appName: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 8,
  },
  tagline: {
    color: COLORS.TEXT_MUTED,
    fontSize: 16,
  },
  form: {
    gap: SPACING.MD,
    marginBottom: SPACING['2XL'],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.BG_CARD,
    borderRadius: RADIUS.LG,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    paddingHorizontal: SPACING.LG,
    height: 54,
  },
  inputIcon: {
    marginRight: SPACING.MD,
  },
  input: {
    flex: 1,
    color: COLORS.TEXT_PRIMARY,
    fontSize: 15,
  },
  eyeButton: {
    padding: SPACING.SM,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    paddingVertical: SPACING.SM,
  },
  forgotText: {
    color: COLORS.PURPLE_LIGHT,
    fontSize: 14,
  },
  loginButton: {
    height: 54,
    borderRadius: RADIUS.LG,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.SM,
  },
  loginButtonText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.MD,
    marginVertical: SPACING.SM,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.BORDER,
  },
  dividerText: {
    color: COLORS.TEXT_MUTED,
    fontSize: 13,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: RADIUS.LG,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    backgroundColor: COLORS.BG_CARD,
    gap: SPACING.MD,
  },
  googleIcon: {
    color: '#4285F4',
    fontSize: 18,
    fontWeight: '700',
  },
  googleText: {
    color: COLORS.TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '500',
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: RADIUS.LG,
    borderWidth: 1,
    borderColor: COLORS.PURPLE,
    backgroundColor: 'rgba(124,58,237,0.1)',
    gap: SPACING.MD,
  },
  phoneText: {
    color: COLORS.PURPLE_LIGHT,
    fontSize: 15,
    fontWeight: '500',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: COLORS.TEXT_MUTED,
    fontSize: 15,
  },
  signupLink: {
    color: COLORS.PURPLE_LIGHT,
    fontSize: 15,
    fontWeight: '700',
  },
});
