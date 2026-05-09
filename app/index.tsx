import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../src/store/authStore';
import { COLORS } from '../src/constants';

export default function IndexPage() {
  const router = useRouter();
  const { isInitialized, session } = useAuthStore();

  useEffect(() => {
    if (isInitialized) {
      if (session) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/onboarding');
      }
    }
  }, [isInitialized, session]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.BG_PRIMARY, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={COLORS.PURPLE} size="large" />
    </View>
  );
}
