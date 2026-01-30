import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '@/services/storage';
import type { User } from '@/types';
import { MorningBriefCard, RecommendationsCard, TodayScheduleCard, ReadinessIndicator } from '@/components/teen';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await storage.getUser<User>();
    setUser(userData);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUser();
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#10B981"
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>{getGreeting()},</Text>
            <Text style={styles.userName}>{user?.displayName || 'Athlete'}!</Text>
          </View>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={16} color="#64748B" />
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </Text>
          </View>
        </View>

        <ReadinessIndicator />
        <MorningBriefCard />
        <TodayScheduleCard />
        <RecommendationsCard />

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    marginBottom: 4,
  },
  greetingText: {
    fontSize: 16,
    color: '#64748B',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#64748B',
  },
  footer: {
    height: 24,
  },
});
