import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Slider } from '@/components/ui';

interface ScheduleItem {
  id: string;
  name: string;
  time: string;
  duration: string;
  type: 'workout' | 'school' | 'other';
}

interface TodayScheduleCardProps {
  nextActivity?: ScheduleItem;
  readinessLevel?: 'high' | 'moderate' | 'low';
  onAdjust?: (soreness: number, availability: string) => void;
}

export function TodayScheduleCard({ nextActivity, readinessLevel = 'high', onAdjust }: TodayScheduleCardProps) {
  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [soreness, setSoreness] = useState(2);
  const [availability, setAvailability] = useState<'full' | 'light' | 'rest'>('full');

  const mockActivity: ScheduleItem = nextActivity || {
    id: '1',
    name: 'Soccer Practice',
    time: '4:00 PM',
    duration: '90 min',
    type: 'workout',
  };

  const getReadinessColor = (level: 'high' | 'moderate' | 'low') => {
    switch (level) {
      case 'high': return '#10B981';
      case 'moderate': return '#F59E0B';
      case 'low': return '#EF4444';
    }
  };

  const getReadinessLabel = (level: 'high' | 'moderate' | 'low') => {
    switch (level) {
      case 'high': return 'Ready to go';
      case 'moderate': return 'Take it easy';
      case 'low': return 'Consider resting';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'workout': return 'barbell';
      case 'school': return 'school';
      default: return 'calendar';
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="time" size={24} color="#3B82F6" />
          <Text style={styles.title}>Next Up</Text>
        </View>
        <View style={[styles.readinessBadge, { backgroundColor: getReadinessColor(readinessLevel) + '20' }]}>
          <View style={[styles.readinessDot, { backgroundColor: getReadinessColor(readinessLevel) }]} />
          <Text style={[styles.readinessText, { color: getReadinessColor(readinessLevel) }]}>
            {getReadinessLabel(readinessLevel)}
          </Text>
        </View>
      </View>

      <View style={styles.activityRow}>
        <View style={styles.activityIcon}>
          <Ionicons name={getActivityIcon(mockActivity.type) as never} size={28} color="#3B82F6" />
        </View>
        <View style={styles.activityInfo}>
          <Text style={styles.activityName}>{mockActivity.name}</Text>
          <Text style={styles.activityTime}>{mockActivity.time} • {mockActivity.duration}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.adjustButton}
        onPress={() => setAdjustModalVisible(true)}
        testID="button-adjust-today"
      >
        <Ionicons name="settings-outline" size={18} color="#10B981" />
        <Text style={styles.adjustButtonText}>Adjust today</Text>
      </TouchableOpacity>

      <Modal
        visible={adjustModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAdjustModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>How are you feeling?</Text>
              <TouchableOpacity onPress={() => setAdjustModalVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Update your status and we'll adjust your recommendations
            </Text>

            <Slider
              label="Soreness Level"
              value={soreness}
              onValueChange={setSoreness}
              min={1}
              max={5}
              step={1}
              leftLabel="None"
              rightLabel="Very Sore"
              testID="slider-soreness"
            />

            <View style={styles.availabilitySection}>
              <Text style={styles.availabilityLabel}>Available for training?</Text>
              <View style={styles.availabilityOptions}>
                <TouchableOpacity 
                  style={[styles.availabilityOption, availability === 'full' && styles.availabilitySelected]}
                  onPress={() => setAvailability('full')}
                  testID="button-availability-full"
                >
                  <Text style={availability === 'full' ? styles.availabilityOptionTextSelected : styles.availabilityOptionText}>
                    Full session
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.availabilityOption, availability === 'light' && styles.availabilitySelected]}
                  onPress={() => setAvailability('light')}
                  testID="button-availability-light"
                >
                  <Text style={availability === 'light' ? styles.availabilityOptionTextSelected : styles.availabilityOptionText}>
                    Light only
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.availabilityOption, availability === 'rest' && styles.availabilitySelected]}
                  onPress={() => setAvailability('rest')}
                  testID="button-availability-rest"
                >
                  <Text style={availability === 'rest' ? styles.availabilityOptionTextSelected : styles.availabilityOptionText}>
                    Rest day
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Button
              title="Update"
              onPress={() => {
                onAdjust?.(soreness, availability);
                setAdjustModalVisible(false);
              }}
              testID="button-update-status"
            />
          </View>
        </View>
      </Modal>
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
  readinessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  readinessDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  readinessText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  activityIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 14,
    color: '#64748B',
  },
  adjustButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#E8F5F0',
    borderRadius: 12,
  },
  adjustButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 24,
  },
  availabilitySection: {
    marginBottom: 24,
  },
  availabilityLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  availabilityOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  availabilityOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  availabilitySelected: {
    backgroundColor: '#E8F5F0',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  availabilityOptionText: {
    fontSize: 14,
    color: '#64748B',
  },
  availabilityOptionTextSelected: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
});
