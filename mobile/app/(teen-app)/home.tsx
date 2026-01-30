import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { storage } from '@/services/storage';
import type { User } from '@/types';
import { useRecommendations } from '@/hooks/useApi';
import { 
  MorningBriefCard, 
  RecommendationsCard, 
  TodayScheduleCard, 
  ReadinessIndicator,
  WeekFocusCard,
  EscalationAlertBanner
} from '@/components/teen';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [dismissedEscalations, setDismissedEscalations] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();
  const { data: recommendations } = useRecommendations();

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
    queryClient.invalidateQueries({ queryKey: ['recommendations'] });
    queryClient.invalidateQueries({ queryKey: ['morningBrief'] });
    setTimeout(() => setRefreshing(false), 1000);
  }, [queryClient]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getEscalationKey = (flag: { type: string; reason: string }) => 
    `${flag.type}_${flag.reason.slice(0, 50)}`;

  const handleDismissEscalation = (index: number) => {
    const flag = recommendations?.escalation_flags?.[index];
    if (flag) {
      const key = getEscalationKey(flag);
      setDismissedEscalations(prev => new Set([...prev, key]));
    }
  };

  const visibleEscalations = recommendations?.escalation_flags?.filter(
    (flag) => !dismissedEscalations.has(getEscalationKey(flag))
  ) || [];

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

        <EscalationAlertBanner 
          flags={visibleEscalations}
          onDismiss={handleDismissEscalation}
        />

        <ReadinessIndicator />
        <MorningBriefCard />
        
        {recommendations?.week_focus && (
          <WeekFocusCard weekFocus={recommendations.week_focus} />
        )}
        
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
