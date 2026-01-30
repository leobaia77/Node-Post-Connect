import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui';

interface RiskIndicator {
  id: string;
  type: 'sleep' | 'training' | 'pain';
  title: string;
  description: string;
  severity: 'warning' | 'critical';
}

interface AtRiskIndicatorsProps {
  indicators?: RiskIndicator[];
  onViewAlerts?: () => void;
}

export function AtRiskIndicators({ 
  indicators = [],
  onViewAlerts,
}: AtRiskIndicatorsProps) {
  if (indicators.length === 0) {
    return (
      <Card style={styles.card}>
        <View style={styles.allGood}>
          <View style={styles.allGoodIcon}>
            <Ionicons name="checkmark-circle" size={32} color="#10B981" />
          </View>
          <View style={styles.allGoodText}>
            <Text style={styles.allGoodTitle}>Looking Good!</Text>
            <Text style={styles.allGoodDescription}>
              No areas of concern this week. Keep supporting your teen's healthy habits.
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'sleep': return 'moon';
      case 'training': return 'barbell';
      case 'pain': return 'medical';
      default: return 'warning';
    }
  };

  const getColor = (severity: string) => {
    return severity === 'critical' ? '#EF4444' : '#F59E0B';
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="alert-circle" size={24} color="#F59E0B" />
        <Text style={styles.title}>Areas to Discuss</Text>
      </View>

      <Text style={styles.subtitle}>
        These patterns may benefit from a supportive conversation
      </Text>

      {indicators.map((indicator) => (
        <TouchableOpacity 
          key={indicator.id}
          style={styles.indicatorRow}
          onPress={onViewAlerts}
          testID={`indicator-${indicator.id}`}
        >
          <View style={[styles.indicatorIcon, { backgroundColor: getColor(indicator.severity) + '20' }]}>
            <Ionicons 
              name={getIcon(indicator.type) as never} 
              size={20} 
              color={getColor(indicator.severity)} 
            />
          </View>
          <View style={styles.indicatorInfo}>
            <Text style={styles.indicatorTitle}>{indicator.title}</Text>
            <Text style={styles.indicatorDescription}>{indicator.description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </TouchableOpacity>
      ))}

      {onViewAlerts && (
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={onViewAlerts}
          testID="button-view-all-alerts"
        >
          <Text style={styles.viewAllText}>View All Alerts</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  indicatorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  indicatorTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  indicatorDescription: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  viewAllButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  allGood: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  allGoodIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  allGoodText: {
    flex: 1,
  },
  allGoodTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#10B981',
  },
  allGoodDescription: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
});
