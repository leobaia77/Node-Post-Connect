import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui';
import { useScoliosisStatus } from '@/hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';

interface QuickActionProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
  testId: string;
}

function QuickAction({ title, subtitle, icon, color, onPress, testId }: QuickActionProps) {
  return (
    <TouchableOpacity onPress={onPress} data-testid={testId}>
      <Card style={styles.quickAction}>
        <View style={[styles.quickActionIcon, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.quickActionTitle}>{title}</Text>
        <Text style={styles.quickActionSubtitle}>{subtitle}</Text>
      </Card>
    </TouchableOpacity>
  );
}

interface ProgressRingProps {
  progress: number;
  size: number;
  strokeWidth: number;
  color: string;
}

function ProgressRing({ progress, size, strokeWidth, color }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <View style={[styles.progressRingBg, { width: size, height: size, borderRadius: size / 2, borderWidth: strokeWidth }]} />
      <View style={[styles.progressRingFill, { 
        width: size, 
        height: size, 
        borderRadius: size / 2, 
        borderWidth: strokeWidth,
        borderColor: color,
        transform: [{ rotate: '-90deg' }],
      }]} />
      <View style={styles.progressRingContent}>
        <Text style={[styles.progressRingPercent, { color }]}>{Math.round(progress)}%</Text>
      </View>
    </View>
  );
}

export default function ScoliosisDashboardScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: status, isLoading } = useScoliosisStatus();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['scoliosisStatus'] });
    setRefreshing(false);
  }, [queryClient]);

  const braceProgress = status?.braceTargetHours 
    ? Math.min(100, (status.todayBraceHours / status.braceTargetHours) * 100) 
    : 0;
  const ptProgress = status?.weeklyPtTarget 
    ? Math.min(100, (status.weeklyPtCompleted / status.weeklyPtTarget) * 100) 
    : 0;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#10B981" />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Scoliosis Care</Text>
          <Text style={styles.subtitle}>Track your PT, brace wear, and symptoms</Text>
        </View>

        <View style={styles.progressCards}>
          <Card style={styles.progressCard}>
            <Text style={styles.progressLabel}>Brace Today</Text>
            <View style={styles.progressContent}>
              <ProgressRing progress={braceProgress} size={80} strokeWidth={8} color="#10B981" />
              <View style={styles.progressDetails}>
                <Text style={styles.progressValue}>{status?.todayBraceHours?.toFixed(1) || 0}h</Text>
                <Text style={styles.progressTarget}>/ {status?.braceTargetHours || 0}h goal</Text>
              </View>
            </View>
          </Card>

          <Card style={styles.progressCard}>
            <Text style={styles.progressLabel}>PT This Week</Text>
            <View style={styles.progressContent}>
              <ProgressRing progress={ptProgress} size={80} strokeWidth={8} color="#8B5CF6" />
              <View style={styles.progressDetails}>
                <Text style={styles.progressValue}>{status?.weeklyPtCompleted || 0}</Text>
                <Text style={styles.progressTarget}>/ {status?.weeklyPtTarget || 0} sessions</Text>
              </View>
            </View>
          </Card>
        </View>

        {!status?.hasSymptomLog && (
          <Card style={styles.reminderCard}>
            <View style={styles.reminderContent}>
              <Ionicons name="clipboard-outline" size={24} color="#F59E0B" />
              <View style={styles.reminderText}>
                <Text style={styles.reminderTitle}>Daily Check-in</Text>
                <Text style={styles.reminderSubtitle}>Log how you're feeling today</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.reminderButton}
              onPress={() => router.push('/scoliosis/symptoms')}
              data-testid="button-log-symptoms"
            >
              <Text style={styles.reminderButtonText}>Log Now</Text>
            </TouchableOpacity>
          </Card>
        )}

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <QuickAction
            title="PT Exercises"
            subtitle="Start your routine"
            icon="fitness-outline"
            color="#8B5CF6"
            onPress={() => router.push('/scoliosis/pt-routine')}
            testId="button-pt-exercises"
          />
          <QuickAction
            title="Brace Timer"
            subtitle="Track wear time"
            icon="timer-outline"
            color="#10B981"
            onPress={() => router.push('/scoliosis/brace-tracker')}
            testId="button-brace-tracker"
          />
          <QuickAction
            title="Symptoms"
            subtitle="Log discomfort"
            icon="body-outline"
            color="#F59E0B"
            onPress={() => router.push('/scoliosis/symptoms')}
            testId="button-symptoms"
          />
          <QuickAction
            title="Resources"
            subtitle="Learn more"
            icon="book-outline"
            color="#3B82F6"
            onPress={() => router.push('/scoliosis/resources')}
            testId="button-resources"
          />
        </View>

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
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  progressCards: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  progressCard: {
    flex: 1,
    padding: 16,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
  },
  progressContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressDetails: {
    flex: 1,
  },
  progressValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  progressTarget: {
    fontSize: 12,
    color: '#64748B',
  },
  progressRingBg: {
    position: 'absolute',
    borderColor: '#E2E8F0',
  },
  progressRingFill: {
    position: 'absolute',
  },
  progressRingContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRingPercent: {
    fontSize: 14,
    fontWeight: '700',
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 24,
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  reminderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reminderText: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
  },
  reminderSubtitle: {
    fontSize: 14,
    color: '#B45309',
  },
  reminderButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reminderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  quickAction: {
    width: '47%',
    padding: 16,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  footer: {
    height: 24,
  },
});
