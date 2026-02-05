import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '@/components/ui';
import { 
  useBraceSchedule, 
  useActiveBraceSession, 
  useStartBraceSession, 
  useEndBraceSession,
  useScoliosisStatus
} from '@/hooks/useApi';

export default function BraceTrackerScreen() {
  const { data: schedule } = useBraceSchedule();
  const { data: activeSession, refetch: refetchActive } = useActiveBraceSession();
  const { data: status } = useScoliosisStatus();
  const startSession = useStartBraceSession();
  const endSession = useEndBraceSession();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (activeSession?.startTime) {
      const startTime = new Date(activeSession.startTime).getTime();
      const updateElapsed = () => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedSeconds(elapsed);
      };
      updateElapsed();
      intervalRef.current = setInterval(updateElapsed, 1000);
    } else {
      setElapsedSeconds(0);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeSession]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartStop = async () => {
    if (activeSession) {
      await endSession.mutateAsync({ id: activeSession.id });
    } else {
      await startSession.mutateAsync();
    }
    refetchActive();
  };

  const todayHours = status?.todayBraceHours || 0;
  const targetHours = status?.braceTargetHours || 16;
  const progress = Math.min(100, (todayHours / targetHours) * 100);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.timerCard}>
          <View style={styles.timerRing}>
            <View style={styles.timerContent}>
              <Text style={styles.timerLabel}>{activeSession ? 'Current Session' : 'Not Wearing'}</Text>
              <Text style={styles.timerDisplay}>{formatTime(elapsedSeconds)}</Text>
              <Text style={styles.timerHint}>
                {activeSession ? 'Brace on' : 'Press Start when you put on your brace'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.startButton, activeSession && styles.stopButton]}
            onPress={handleStartStop}
            disabled={startSession.isPending || endSession.isPending}
            data-testid="button-start-stop-brace"
          >
            <Ionicons 
              name={activeSession ? 'stop' : 'play'} 
              size={32} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </Card>

        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Today's Progress</Text>
            <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <View style={styles.progressStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{todayHours.toFixed(1)}h</Text>
              <Text style={styles.statLabel}>Worn</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.max(0, targetHours - todayHours).toFixed(1)}h</Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{targetHours}h</Text>
              <Text style={styles.statLabel}>Daily Goal</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Brace Wearing Tips</Text>
          <View style={styles.tip}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.tipText}>Wear a thin cotton shirt underneath for comfort</Text>
          </View>
          <View style={styles.tip}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.tipText}>Check skin daily for any redness or irritation</Text>
          </View>
          <View style={styles.tip}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.tipText}>Keep brace clean and dry</Text>
          </View>
          <View style={styles.tip}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.tipText}>Do your PT exercises daily for best results</Text>
          </View>
        </Card>

        {schedule?.braceType && (
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>Your Brace</Text>
            <Text style={styles.infoValue}>{schedule.braceType}</Text>
            {schedule.prescribedBy && (
              <Text style={styles.infoSecondary}>Prescribed by {schedule.prescribedBy}</Text>
            )}
          </Card>
        )}

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
  timerCard: {
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  timerRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  timerContent: {
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  timerDisplay: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1F2937',
    fontVariant: ['tabular-nums'],
  },
  timerHint: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
  },
  startButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  stopButton: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  progressCard: {
    padding: 20,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 6,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  tipsCard: {
    padding: 20,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  infoCard: {
    padding: 20,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  infoSecondary: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  footer: {
    height: 24,
  },
});
