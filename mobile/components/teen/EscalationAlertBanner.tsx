import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { EscalationFlag } from '@/types';

interface EscalationAlertBannerProps {
  flags: EscalationFlag[];
  onDismiss?: (index: number) => void;
}

const URGENCY_COLORS = {
  immediate: '#EF4444',
  soon: '#F59E0B',
  routine: '#3B82F6',
};

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  consult_professional: 'medical',
  parent_notification: 'people',
  urgent_concern: 'warning',
};

export function EscalationAlertBanner({ flags, onDismiss }: EscalationAlertBannerProps) {
  if (!flags || flags.length === 0) {
    return null;
  }

  const handleLearnMore = (flag: EscalationFlag) => {
    if (flag.type === 'consult_professional') {
      Linking.openURL('https://www.healthfinder.gov/FindServices/').catch(() => {});
    }
  };

  return (
    <View style={styles.container}>
      {flags.map((flag, index) => (
        <View 
          key={index} 
          style={[styles.alert, { borderLeftColor: URGENCY_COLORS[flag.urgency] }]}
        >
          <View style={styles.iconContainer}>
            <Ionicons 
              name={TYPE_ICONS[flag.type] || 'alert-circle'} 
              size={24} 
              color={URGENCY_COLORS[flag.urgency]} 
            />
          </View>
          
          <View style={styles.content}>
            <Text style={styles.urgencyLabel}>
              {flag.urgency === 'immediate' ? 'Important' : 
               flag.urgency === 'soon' ? 'Heads Up' : 'For Your Info'}
            </Text>
            <Text style={styles.reason}>{flag.reason}</Text>
            
            {flag.type === 'consult_professional' && (
              <Text style={styles.careNote}>
                Please follow up with your care team
              </Text>
            )}
            
            <View style={styles.actions}>
              <TouchableOpacity 
                style={styles.learnMoreButton}
                onPress={() => handleLearnMore(flag)}
                testID={`escalation-learn-more-${index}`}
              >
                <Text style={styles.learnMoreText}>Learn More</Text>
                <Ionicons name="arrow-forward" size={14} color="#3B82F6" />
              </TouchableOpacity>
              
              {onDismiss && (
                <TouchableOpacity 
                  style={styles.dismissButton}
                  onPress={() => onDismiss(index)}
                  testID={`escalation-dismiss-${index}`}
                >
                  <Ionicons name="close" size={18} color="#64748B" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    gap: 12,
  },
  alert: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderLeftWidth: 4,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  content: {
    flex: 1,
  },
  urgencyLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  reason: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    lineHeight: 20,
    marginBottom: 8,
  },
  careNote: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
    marginBottom: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  learnMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3B82F6',
  },
  dismissButton: {
    padding: 4,
  },
});
