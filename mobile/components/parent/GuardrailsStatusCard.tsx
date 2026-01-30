import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui';

interface Guardrail {
  id: string;
  name: string;
  value: string;
  status: 'compliant' | 'approaching' | 'exceeded';
}

interface GuardrailsStatusCardProps {
  guardrails?: Guardrail[];
  onEditGuardrails?: () => void;
}

export function GuardrailsStatusCard({ 
  guardrails = [
    { id: '1', name: 'Weekly Training', value: 'Max 10 hours', status: 'compliant' },
    { id: '2', name: 'Nightly Sleep', value: 'Min 8 hours', status: 'compliant' },
    { id: '3', name: 'Weight-Loss Mode', value: 'Disabled', status: 'compliant' },
  ],
  onEditGuardrails,
}: GuardrailsStatusCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return 'checkmark-circle';
      case 'approaching': return 'alert-circle';
      case 'exceeded': return 'warning';
      default: return 'checkmark-circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return '#10B981';
      case 'approaching': return '#F59E0B';
      case 'exceeded': return '#EF4444';
      default: return '#10B981';
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="shield-checkmark" size={24} color="#3B82F6" />
          <Text style={styles.title}>Safety Guardrails</Text>
        </View>
        {onEditGuardrails && (
          <TouchableOpacity 
            style={styles.editButton}
            onPress={onEditGuardrails}
            testID="button-edit-guardrails"
          >
            <Ionicons name="pencil" size={16} color="#3B82F6" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.description}>
        These limits help ensure healthy balance while supporting your teen's goals
      </Text>

      {guardrails.map((guardrail) => (
        <View key={guardrail.id} style={styles.guardrailRow}>
          <View style={styles.guardrailInfo}>
            <Text style={styles.guardrailName}>{guardrail.name}</Text>
            <Text style={styles.guardrailValue}>{guardrail.value}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Ionicons 
              name={getStatusIcon(guardrail.status) as never} 
              size={18} 
              color={getStatusColor(guardrail.status)} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(guardrail.status) }]}>
              {guardrail.status === 'compliant' ? 'On Track' : 
               guardrail.status === 'approaching' ? 'Approaching' : 'Exceeded'}
            </Text>
          </View>
        </View>
      ))}

      <View style={styles.tipSection}>
        <Ionicons name="bulb-outline" size={18} color="#F59E0B" />
        <Text style={styles.tipText}>
          Tip: Guardrails work best when discussed with your teen as collaborative goals
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
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  guardrailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  guardrailInfo: {
    flex: 1,
  },
  guardrailName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  guardrailValue: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tipSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  tipText: {
    fontSize: 12,
    color: '#92400E',
    flex: 1,
    lineHeight: 18,
  },
});
