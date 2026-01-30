import { View, Text, StyleSheet, SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { TeenStatusCard, WeeklySummaryCard, AtRiskIndicators, GuardrailsStatusCard } from '@/components/parent';

export default function OverviewScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [sharingEnabled, setSharingEnabled] = useState(true);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const mockRiskIndicators = [
    {
      id: '1',
      type: 'sleep' as const,
      title: 'Sleep Deficit',
      description: 'Average 6.5 hours this week (target: 8+)',
      severity: 'warning' as const,
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#3B82F6"
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Support Your Teen's Goals</Text>
          <Text style={styles.subtitle}>
            Here's how they're doing this week
          </Text>
        </View>

        <View style={styles.privacyBanner}>
          <Ionicons name="shield-checkmark" size={16} color="#10B981" />
          <Text style={styles.privacyBannerText}>
            Data shared according to your teen's privacy preferences
          </Text>
        </View>

        <TeenStatusCard
          teenName="Alex"
          lastActive="2 hours ago"
          sleepStatus="moderate"
          activityStatus="good"
          moodStatus="good"
          sharingEnabled={sharingEnabled}
        />

        <WeeklySummaryCard
          sleepAverage={7.2}
          sleepConsistency={78}
          trainingMinutes={480}
          trainingSessionCount={6}
          nutritionAdherence={72}
          detailedView={sharingEnabled}
          onViewDetails={() => router.push('/(parent-app)/trends')}
        />

        <AtRiskIndicators
          indicators={mockRiskIndicators}
          onViewAlerts={() => router.push('/(parent-app)/alerts')}
        />

        <GuardrailsStatusCard
          onEditGuardrails={() => router.push('/(parent-app)/settings/guardrails')}
        />

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
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  footer: {
    height: 24,
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F5F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  privacyBannerText: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
  },
});
