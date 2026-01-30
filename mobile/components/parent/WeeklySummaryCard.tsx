import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui';

interface WeeklySummaryCardProps {
  sleepAverage?: number;
  sleepConsistency?: number;
  trainingMinutes?: number;
  trainingSessionCount?: number;
  nutritionAdherence?: number;
  detailedView?: boolean;
  onViewDetails?: () => void;
}

export function WeeklySummaryCard({
  sleepAverage = 7.5,
  sleepConsistency = 82,
  trainingMinutes = 420,
  trainingSessionCount = 5,
  nutritionAdherence = 68,
  detailedView = false,
  onViewDetails,
}: WeeklySummaryCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>This Week's Summary</Text>
        <TouchableOpacity 
          style={styles.infoButton} 
          testID="button-summary-info"
          accessibilityLabel="Summary information"
        >
          <Ionicons name="information-circle-outline" size={20} color="#64748B" />
        </TouchableOpacity>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <View style={styles.metricIcon}>
            <Ionicons name="moon" size={24} color="#8B5CF6" />
          </View>
          <Text style={styles.metricValue}>{sleepAverage}h</Text>
          <Text style={styles.metricLabel}>Sleep Avg</Text>
          <View style={styles.metricSubRow}>
            <Text style={styles.metricSubtext}>{sleepConsistency}% consistent</Text>
          </View>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricIcon}>
            <Ionicons name="barbell" size={24} color="#F59E0B" />
          </View>
          <Text style={styles.metricValue}>{Math.round(trainingMinutes / 60)}h</Text>
          <Text style={styles.metricLabel}>Training</Text>
          <View style={styles.metricSubRow}>
            <Text style={styles.metricSubtext}>{trainingSessionCount} sessions</Text>
          </View>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricIcon}>
            <Ionicons name="nutrition" size={24} color="#10B981" />
          </View>
          <Text style={styles.metricValue}>{nutritionAdherence}%</Text>
          <Text style={styles.metricLabel}>Nutrition</Text>
          <View style={styles.metricSubRow}>
            <Text style={styles.metricSubtext}>meals logged</Text>
          </View>
        </View>
      </View>

      {detailedView && onViewDetails && (
        <TouchableOpacity 
          style={styles.detailsLink}
          onPress={onViewDetails}
          testID="button-view-details"
        >
          <Text style={styles.detailsLinkText}>View detailed breakdown</Text>
          <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
        </TouchableOpacity>
      )}

      <View style={styles.noteSection}>
        <Ionicons name="shield-checkmark" size={16} color="#10B981" />
        <Text style={styles.noteText}>
          Showing data your teen has chosen to share with you
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  infoButton: {
    padding: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  metricIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  metricSubRow: {
    marginTop: 4,
  },
  metricSubtext: {
    fontSize: 10,
    color: '#94A3B8',
  },
  detailsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    marginBottom: 12,
  },
  detailsLinkText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  noteSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F5F0',
    borderRadius: 8,
    padding: 12,
  },
  noteText: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
});
