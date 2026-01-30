import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, ProgressBar } from '@/components/ui';
import { useUpdateTeenProfile } from '@/hooks/useApi';

const DAYS = [
  { id: 'monday', label: 'Mon' },
  { id: 'tuesday', label: 'Tue' },
  { id: 'wednesday', label: 'Wed' },
  { id: 'thursday', label: 'Thu' },
  { id: 'friday', label: 'Fri' },
  { id: 'saturday', label: 'Sat' },
  { id: 'sunday', label: 'Sun' },
];

const TIME_SLOTS = [
  { id: 'morning', label: 'Morning', time: '6am-12pm', icon: 'sunny' },
  { id: 'afternoon', label: 'Afternoon', time: '12pm-5pm', icon: 'partly-sunny' },
  { id: 'evening', label: 'Evening', time: '5pm-10pm', icon: 'moon' },
];

interface Availability {
  [day: string]: string[];
}

export default function AvailabilityScreen() {
  const [availability, setAvailability] = useState<Availability>({});
  const router = useRouter();
  const updateProfile = useUpdateTeenProfile();

  const toggleSlot = (day: string, slot: string) => {
    setAvailability((prev) => {
      const daySlots = prev[day] || [];
      if (daySlots.includes(slot)) {
        return { ...prev, [day]: daySlots.filter((s) => s !== slot) };
      } else {
        return { ...prev, [day]: [...daySlots, slot] };
      }
    });
  };

  const handleContinue = async () => {
    try {
      await updateProfile.mutateAsync({ weeklyAvailability: availability } as never);
      router.push('/(teen-onboarding)/connect-health');
    } catch {
    }
  };

  const handleBack = () => {
    router.back();
  };

  const isSlotSelected = (day: string, slot: string) => {
    return (availability[day] || []).includes(slot);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ProgressBar current={4} total={6} />

        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        
        <View style={styles.header}>
          <Text style={styles.title}>When can you train?</Text>
          <Text style={styles.subtitle}>
            Tap to select your available time blocks
          </Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.grid}>
            <View style={styles.headerRow}>
              <View style={styles.dayHeaderEmpty} />
              {TIME_SLOTS.map((slot) => (
                <View key={slot.id} style={styles.slotHeader}>
                  <Ionicons name={slot.icon as never} size={16} color="#64748B" />
                  <Text style={styles.slotHeaderText}>{slot.label}</Text>
                </View>
              ))}
            </View>

            {DAYS.map((day) => (
              <View key={day.id} style={styles.dayRow}>
                <Text style={styles.dayLabel}>{day.label}</Text>
                {TIME_SLOTS.map((slot) => {
                  const isSelected = isSlotSelected(day.id, slot.id);
                  return (
                    <TouchableOpacity
                      key={slot.id}
                      style={[
                        styles.slotCell,
                        isSelected && styles.slotCellSelected,
                      ]}
                      onPress={() => toggleSlot(day.id, slot.id)}
                      testID={`slot-${day.id}-${slot.id}`}
                    >
                      {isSelected && (
                        <Ionicons name="checkmark" size={20} color="#10B981" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          <Card style={styles.tipCard}>
            <Ionicons name="information-circle" size={24} color="#10B981" />
            <Text style={styles.tipText}>
              We'll use this to suggest optimal training times
            </Text>
          </Card>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            loading={updateProfile.isPending}
            testID="button-continue"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    padding: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8F5F0',
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeaderEmpty: {
    width: 40,
  },
  slotHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  slotHeaderText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayLabel: {
    width: 40,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  slotCell: {
    flex: 1,
    height: 44,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotCellSelected: {
    backgroundColor: '#E8F5F0',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
    backgroundColor: '#E8F5F0',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  footer: {
    paddingTop: 16,
  },
});
