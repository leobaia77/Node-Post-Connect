import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui';
import { useMorningBrief } from '@/hooks/useApi';
import type { MorningBrief } from '@/types';

export function MorningBriefCard() {
  const [expanded, setExpanded] = useState(false);
  const { data: brief, isLoading, error } = useMorningBrief();

  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable' | 'increasing' | 'decreasing'): keyof typeof Ionicons.glyphMap => {
    switch (trend) {
      case 'improving':
      case 'increasing': return 'arrow-up';
      case 'declining':
      case 'decreasing': return 'arrow-down';
      default: return 'remove';
    }
  };

  const getTrendColor = (trend: 'improving' | 'declining' | 'stable' | 'increasing' | 'decreasing', type: 'sleep' | 'training') => {
    if (type === 'sleep') {
      switch (trend) {
        case 'improving': return '#10B981';
        case 'declining': return '#EF4444';
        default: return '#64748B';
      }
    } else {
      switch (trend) {
        case 'increasing': return '#F59E0B';
        case 'decreasing': return '#10B981';
        default: return '#64748B';
      }
    }
  };

  const getCompletenessColor = (completeness: 'full' | 'partial' | 'minimal') => {
    switch (completeness) {
      case 'full': return '#10B981';
      case 'partial': return '#F59E0B';
      default: return '#EF4444';
    }
  };

  if (isLoading) {
    return (
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="sunny" size={24} color="#F59E0B" />
            <Text style={styles.title}>Your Weekly Summary</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#F59E0B" />
        </View>
      </Card>
    );
  }

  if (error || !brief) {
    return (
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="sunny" size={24} color="#F59E0B" />
            <Text style={styles.title}>Your Weekly Summary</Text>
          </View>
        </View>
        <Text style={styles.noDataText}>Log some health data to see your summary</Text>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <TouchableOpacity 
        onPress={() => setExpanded(!expanded)}
        style={styles.header}
        testID="morning-brief-toggle"
      >
        <View style={styles.headerLeft}>
          <Ionicons name="sunny" size={24} color="#F59E0B" />
          <Text style={styles.title}>Your Weekly Summary</Text>
        </View>
        <Ionicons 
          name={expanded ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color="#64748B" 
        />
      </TouchableOpacity>

      <View style={styles.quickStats}>
        <View style={styles.quickStat}>
          <Ionicons name="moon" size={16} color="#8B5CF6" />
          <Text style={styles.quickStatValue}>{brief.sleep_summary.avg_hours.toFixed(1)}h</Text>
          <Ionicons 
            name={getTrendIcon(brief.sleep_summary.trend)} 
            size={12} 
            color={getTrendColor(brief.sleep_summary.trend, 'sleep')} 
          />
        </View>
        <View style={styles.quickStat}>
          <Ionicons name="barbell" size={16} color="#F59E0B" />
          <Text style={styles.quickStatValue}>{brief.training_summary.total_minutes_7d}m</Text>
        </View>
        <View style={styles.quickStat}>
          <Ionicons name="restaurant-outline" size={16} color="#10B981" />
          <View style={[styles.statusDot, { backgroundColor: getCompletenessColor(brief.nutrition_summary.completeness) }]} />
        </View>
      </View>

      {expanded && (
        <View style={styles.content}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="moon" size={20} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Sleep</Text>
            </View>
            <View style={styles.metrics}>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{brief.sleep_summary.avg_hours.toFixed(1)}h</Text>
                <Text style={styles.metricLabel}>avg / night</Text>
              </View>
              <View style={styles.metric}>
                <View style={styles.trendBadge}>
                  <Ionicons 
                    name={getTrendIcon(brief.sleep_summary.trend)} 
                    size={14} 
                    color={getTrendColor(brief.sleep_summary.trend, 'sleep')} 
                  />
                  <Text style={[styles.trendText, { color: getTrendColor(brief.sleep_summary.trend, 'sleep') }]}>
                    {brief.sleep_summary.trend}
                  </Text>
                </View>
                <Text style={styles.metricLabel}>trend</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{brief.sleep_summary.nights_logged}</Text>
                <Text style={styles.metricLabel}>nights logged</Text>
              </View>
            </View>
            {brief.sleep_summary.avg_hours < 8 && (
              <View style={styles.insight}>
                <Ionicons name="information-circle" size={14} color="#F59E0B" />
                <Text style={styles.insightText}>Target: 8-10 hours for teen athletes</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="barbell" size={20} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Training</Text>
            </View>
            <View style={styles.metrics}>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{brief.training_summary.total_minutes_7d}</Text>
                <Text style={styles.metricLabel}>min / 7 days</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{brief.training_summary.sessions}</Text>
                <Text style={styles.metricLabel}>sessions</Text>
              </View>
              <View style={styles.metric}>
                <View style={styles.trendBadge}>
                  <Ionicons 
                    name={getTrendIcon(brief.training_summary.load_trend)} 
                    size={14} 
                    color={getTrendColor(brief.training_summary.load_trend, 'training')} 
                  />
                  <Text style={[styles.trendText, { color: getTrendColor(brief.training_summary.load_trend, 'training') }]}>
                    {brief.training_summary.load_trend}
                  </Text>
                </View>
                <Text style={styles.metricLabel}>load</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="restaurant-outline" size={20} color="#10B981" />
              <Text style={styles.sectionTitle}>Nutrition</Text>
            </View>
            <View style={styles.metrics}>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{brief.nutrition_summary.meals_logged_7d}</Text>
                <Text style={styles.metricLabel}>meals logged</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>
                  {brief.nutrition_summary.avg_protein ? `${brief.nutrition_summary.avg_protein}g` : '--'}
                </Text>
                <Text style={styles.metricLabel}>avg protein</Text>
              </View>
              <View style={styles.metric}>
                <View style={[styles.completenessIndicator, { backgroundColor: getCompletenessColor(brief.nutrition_summary.completeness) }]}>
                  <Text style={styles.completenessText}>{brief.nutrition_summary.completeness}</Text>
                </View>
                <Text style={styles.metricLabel}>completeness</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="heart" size={20} color="#EF4444" />
              <Text style={styles.sectionTitle}>Check-ins</Text>
            </View>
            <View style={styles.metrics}>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>
                  {brief.checkin_summary.avg_energy ? brief.checkin_summary.avg_energy.toFixed(1) : '--'}
                </Text>
                <Text style={styles.metricLabel}>energy</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>
                  {brief.checkin_summary.avg_soreness ? brief.checkin_summary.avg_soreness.toFixed(1) : '--'}
                </Text>
                <Text style={styles.metricLabel}>soreness</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{brief.checkin_summary.days_logged}</Text>
                <Text style={styles.metricLabel}>days logged</Text>
              </View>
            </View>
            {brief.checkin_summary.pain_flags > 0 && (
              <View style={styles.warningInsight}>
                <Ionicons name="warning" size={14} color="#EF4444" />
                <Text style={styles.warningText}>{brief.checkin_summary.pain_flags} pain flag(s) this week</Text>
              </View>
            )}
          </View>

          {brief.pt_summary.has_routine && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="walk-outline" size={20} color="#3B82F6" />
                <Text style={styles.sectionTitle}>PT Exercises</Text>
              </View>
              <View style={styles.metrics}>
                <View style={styles.metric}>
                  <Text style={styles.metricValue}>
                    {brief.pt_summary.recent_adherence_percent !== null 
                      ? `${brief.pt_summary.recent_adherence_percent}%` 
                      : '--'}
                  </Text>
                  <Text style={styles.metricLabel}>adherence</Text>
                </View>
              </View>
            </View>
          )}

          {brief.active_goals.length > 0 && (
            <View style={styles.goalsSection}>
              <Text style={styles.goalsTitle}>Active Goals</Text>
              <View style={styles.goalTags}>
                {brief.active_goals.map((goal) => (
                  <View key={goal.id} style={styles.goalTag}>
                    <Text style={styles.goalTagText}>{goal.name}</Text>
                    <Text style={styles.goalPriority}>P{goal.priority}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
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
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  loadingContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  noDataText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8F5F0',
  },
  quickStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  content: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8F5F0',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  completenessIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  completenessText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'capitalize',
  },
  insight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 8,
  },
  insightText: {
    flex: 1,
    fontSize: 12,
    color: '#92400E',
  },
  warningInsight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#991B1B',
  },
  goalsSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8F5F0',
  },
  goalsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  goalTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F5F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  goalTagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10B981',
  },
  goalPriority: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
});
