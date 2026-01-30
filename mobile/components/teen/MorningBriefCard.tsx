import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui';

interface MorningBriefData {
  sleepHours: number;
  sleepTrend: 'up' | 'down' | 'stable';
  trainingMinutes: number;
  nutritionLogged: boolean;
  recoveryFlags: string[];
}

interface MorningBriefCardProps {
  data?: MorningBriefData;
}

export function MorningBriefCard({ data }: MorningBriefCardProps) {
  const [expanded, setExpanded] = useState(false);

  const mockData: MorningBriefData = data || {
    sleepHours: 7.5,
    sleepTrend: 'up',
    trainingMinutes: 90,
    nutritionLogged: true,
    recoveryFlags: [],
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'arrow-up';
      case 'down': return 'arrow-down';
      default: return 'remove';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return '#10B981';
      case 'down': return '#EF4444';
      default: return '#64748B';
    }
  };

  return (
    <Card style={styles.card}>
      <TouchableOpacity 
        onPress={() => setExpanded(!expanded)}
        style={styles.header}
        testID="morning-brief-toggle"
      >
        <View style={styles.headerLeft}>
          <Ionicons name="sunny" size={24} color="#F59E0B" />
          <Text style={styles.title}>Yesterday's Summary</Text>
        </View>
        <Ionicons 
          name={expanded ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color="#64748B" 
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          <View style={styles.statRow}>
            <View style={styles.stat}>
              <View style={styles.statHeader}>
                <Ionicons name="moon" size={20} color="#8B5CF6" />
                <Text style={styles.statLabel}>Sleep</Text>
              </View>
              <View style={styles.statValue}>
                <Text style={styles.statNumber}>{mockData.sleepHours}h</Text>
                <Ionicons 
                  name={getTrendIcon(mockData.sleepTrend)} 
                  size={16} 
                  color={getTrendColor(mockData.sleepTrend)} 
                />
              </View>
            </View>

            <View style={styles.stat}>
              <View style={styles.statHeader}>
                <Ionicons name="barbell" size={20} color="#F59E0B" />
                <Text style={styles.statLabel}>Training</Text>
              </View>
              <Text style={styles.statNumber}>{mockData.trainingMinutes}min</Text>
            </View>

            <View style={styles.stat}>
              <View style={styles.statHeader}>
                <Ionicons name="nutrition" size={20} color="#10B981" />
                <Text style={styles.statLabel}>Nutrition</Text>
              </View>
              <View style={styles.statusBadge}>
                <Ionicons 
                  name={mockData.nutritionLogged ? 'checkmark-circle' : 'close-circle'} 
                  size={16} 
                  color={mockData.nutritionLogged ? '#10B981' : '#EF4444'} 
                />
                <Text style={[
                  styles.statusText,
                  { color: mockData.nutritionLogged ? '#10B981' : '#EF4444' }
                ]}>
                  {mockData.nutritionLogged ? 'Logged' : 'Missing'}
                </Text>
              </View>
            </View>
          </View>

          {mockData.recoveryFlags.length > 0 && (
            <View style={styles.flags}>
              <Text style={styles.flagsTitle}>Recovery Flags</Text>
              {mockData.recoveryFlags.map((flag, index) => (
                <View key={index} style={styles.flagItem}>
                  <Ionicons name="alert-circle" size={16} color="#F59E0B" />
                  <Text style={styles.flagText}>{flag}</Text>
                </View>
              ))}
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
  content: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8F5F0',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  statValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  flags: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8F5F0',
  },
  flagsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  flagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  flagText: {
    fontSize: 14,
    color: '#64748B',
  },
});
