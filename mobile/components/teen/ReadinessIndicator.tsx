import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui';

interface ReadinessData {
  score: number;
  sleep: { value: number; impact: 'positive' | 'neutral' | 'negative' };
  soreness: { value: number; impact: 'positive' | 'neutral' | 'negative' };
  trainingLoad: { value: number; impact: 'positive' | 'neutral' | 'negative' };
}

interface ReadinessIndicatorProps {
  data?: ReadinessData;
}

export function ReadinessIndicator({ data }: ReadinessIndicatorProps) {
  const [expanded, setExpanded] = useState(false);

  const mockData: ReadinessData = data || {
    score: 78,
    sleep: { value: 8.2, impact: 'positive' },
    soreness: { value: 2, impact: 'neutral' },
    trainingLoad: { value: 4.5, impact: 'neutral' },
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#10B981';
    if (score >= 50) return '#F59E0B';
    return '#EF4444';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 70) return 'Great';
    if (score >= 50) return 'Moderate';
    return 'Low';
  };

  const getImpactIcon = (impact: 'positive' | 'neutral' | 'negative') => {
    switch (impact) {
      case 'positive': return 'checkmark-circle';
      case 'negative': return 'alert-circle';
      default: return 'remove-circle';
    }
  };

  const getImpactColor = (impact: 'positive' | 'neutral' | 'negative') => {
    switch (impact) {
      case 'positive': return '#10B981';
      case 'negative': return '#EF4444';
      default: return '#64748B';
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.scoreContainer}>
          <View style={[styles.scoreCircle, { borderColor: getScoreColor(mockData.score) }]}>
            <Text style={[styles.scoreNumber, { color: getScoreColor(mockData.score) }]}>
              {mockData.score}
            </Text>
          </View>
          <View style={styles.scoreLabels}>
            <Text style={styles.title}>Readiness Score</Text>
            <Text style={[styles.scoreLabel, { color: getScoreColor(mockData.score) }]}>
              {getScoreLabel(mockData.score)}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => setExpanded(!expanded)}
          style={styles.expandButton}
          testID="readiness-expand"
        >
          <Text style={styles.expandText}>What drives this?</Text>
          <Ionicons 
            name={expanded ? 'chevron-up' : 'chevron-down'} 
            size={16} 
            color="#10B981" 
          />
        </TouchableOpacity>
      </View>

      {expanded && (
        <View style={styles.factors}>
          <View style={styles.factor}>
            <View style={styles.factorLeft}>
              <Ionicons name="moon" size={20} color="#8B5CF6" />
              <Text style={styles.factorLabel}>Sleep</Text>
            </View>
            <View style={styles.factorRight}>
              <Text style={styles.factorValue}>{mockData.sleep.value}h</Text>
              <Ionicons 
                name={getImpactIcon(mockData.sleep.impact)} 
                size={16} 
                color={getImpactColor(mockData.sleep.impact)} 
              />
            </View>
          </View>

          <View style={styles.factor}>
            <View style={styles.factorLeft}>
              <Ionicons name="body" size={20} color="#F59E0B" />
              <Text style={styles.factorLabel}>Soreness</Text>
            </View>
            <View style={styles.factorRight}>
              <Text style={styles.factorValue}>{mockData.soreness.value}/5</Text>
              <Ionicons 
                name={getImpactIcon(mockData.soreness.impact)} 
                size={16} 
                color={getImpactColor(mockData.soreness.impact)} 
              />
            </View>
          </View>

          <View style={styles.factor}>
            <View style={styles.factorLeft}>
              <Ionicons name="barbell" size={20} color="#3B82F6" />
              <Text style={styles.factorLabel}>Training Load</Text>
            </View>
            <View style={styles.factorRight}>
              <Text style={styles.factorValue}>{mockData.trainingLoad.value}h/wk</Text>
              <Ionicons 
                name={getImpactIcon(mockData.trainingLoad.impact)} 
                size={16} 
                color={getImpactColor(mockData.trainingLoad.impact)} 
              />
            </View>
          </View>
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
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  scoreCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  scoreNumber: {
    fontSize: 24,
    fontWeight: '700',
  },
  scoreLabels: {},
  title: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  factors: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8F5F0',
    gap: 12,
  },
  factor: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  factorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  factorLabel: {
    fontSize: 14,
    color: '#374151',
  },
  factorRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  factorValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
});
