import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { storage } from '@/services/storage';
import { api } from '@/services/api';
import type { User } from '@/types';

export default function Index() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await storage.getToken();
      
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      const response = await api.getCurrentUser() as { user: User };
      const user = response.user;

      if (!user.onboardingComplete) {
        router.replace('/(onboarding)/age-range');
      } else {
        router.replace('/(tabs)');
      }
    } catch {
      await storage.clear();
      router.replace('/(auth)/login');
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});
