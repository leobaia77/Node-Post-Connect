import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui';
import type { WeekFocus } from '@/types';

interface WeekFocusCardProps {
  weekFocus?: WeekFocus;
}

export function WeekFocusCard({ weekFocus }: WeekFocusCardProps) {
  const [expanded, setExpanded] = useState(false);

  if (!weekFocus) {
    return null;
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="flag" size={24} color="#3B82F6" />
          <Text style={styles.title}>This Week's Focus</Text>
        </View>
      </View>

      <Text style={styles.theme}>{weekFocus.theme}</Text>

      <View style={styles.keyPoints}>
        {weekFocus.key_points.map((point, index) => (
          <View key={index} style={styles.keyPoint}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.keyPointText}>{point}</Text>
          </View>
        ))}
      </View>

      {weekFocus.evidence_ids.length > 0 && (
        <TouchableOpacity 
          onPress={() => setExpanded(!expanded)}
          style={styles.evidenceToggle}
          testID="week-focus-evidence-toggle"
        >
          <Text style={styles.evidenceToggleText}>Why these priorities?</Text>
          <Ionicons 
            name={expanded ? 'chevron-up' : 'chevron-down'} 
            size={16} 
            color="#10B981" 
          />
        </TouchableOpacity>
      )}

      {expanded && (
        <View style={styles.evidenceSection}>
          <Text style={styles.evidenceTitle}>Based on research:</Text>
          {weekFocus.evidence_ids.map((evidenceId, index) => (
            <View key={index} style={styles.evidenceItem}>
              <Ionicons name="document-text-outline" size={14} color="#64748B" />
              <Text style={styles.evidenceText}>{evidenceId}</Text>
            </View>
          ))}
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
    marginBottom: 12,
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
  theme: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 16,
    lineHeight: 26,
  },
  keyPoints: {
    gap: 10,
  },
  keyPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  keyPointText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  evidenceToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8F5F0',
  },
  evidenceToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
  evidenceSection: {
    marginTop: 12,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 8,
  },
  evidenceTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  evidenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  evidenceText: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
  },
});
