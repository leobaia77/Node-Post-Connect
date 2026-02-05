import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Input, Slider, Select } from '@/components/ui';

interface DayData {
  date: Date;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  activities: Activity[];
}

interface Activity {
  id: string;
  name: string;
  time: string;
  duration: number;
  type: string;
}

const ACTIVITY_TYPES = [
  { label: 'Training', value: 'training' },
  { label: 'Game/Match', value: 'game' },
  { label: 'PT/Rehab', value: 'pt' },
  { label: 'School', value: 'school' },
  { label: 'Other', value: 'other' },
];

export default function PlanScreen() {
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [activityType, setActivityType] = useState<string | null>(null);
  const [duration, setDuration] = useState(60);
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState('');

  const getWeekDays = (): DayData[] => {
    const today = new Date();
    const days: DayData[] = [];
    
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      days.push({
        date,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        isToday: i === 0,
        activities: i === 0 ? [
          { id: '1', name: 'Soccer Practice', time: '4:00 PM', duration: 90, type: 'training' },
        ] : [],
      });
    }
    
    return days;
  };

  const weekDays = getWeekDays();

  const handleAddActivity = () => {
    setAddModalVisible(false);
    setActivityType(null);
    setDuration(60);
    setIntensity(5);
    setNotes('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Plan</Text>
        <Text style={styles.subtitle}>Schedule and manage activities</Text>
      </View>

      <View style={styles.weekContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weekScroll}
        >
          {weekDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCard,
                day.isToday && styles.dayCardToday,
                day.date.toDateString() === selectedDay.toDateString() && styles.dayCardSelected,
              ]}
              onPress={() => setSelectedDay(day.date)}
            >
              <Text style={[
                styles.dayName,
                day.isToday && styles.dayNameToday,
                day.date.toDateString() === selectedDay.toDateString() && styles.dayNameSelected,
              ]}>
                {day.dayName}
              </Text>
              <Text style={[
                styles.dayNumber,
                day.isToday && styles.dayNumberToday,
                day.date.toDateString() === selectedDay.toDateString() && styles.dayNumberSelected,
              ]}>
                {day.dayNumber}
              </Text>
              {day.activities.length > 0 && (
                <View style={styles.activityDot} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.dateHeader}>
          {selectedDay.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>

        {weekDays.find(d => d.date.toDateString() === selectedDay.toDateString())?.activities.map((activity) => (
          <Card key={activity.id} style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <View style={styles.activityIcon}>
                <Ionicons name="barbell" size={24} color="#10B981" />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityName}>{activity.name}</Text>
                <Text style={styles.activityTime}>{activity.time} • {activity.duration} min</Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="ellipsis-vertical" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
          </Card>
        )) || (
          <Card style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No activities planned</Text>
            <Text style={styles.emptyText}>Tap the + button to add an activity</Text>
          </Card>
        )}

        <View style={styles.freeTimeBlock}>
          <View style={styles.freeTimeHeader}>
            <Ionicons name="time-outline" size={20} color="#10B981" />
            <Text style={styles.freeTimeTitle}>Available Time</Text>
          </View>
          <Text style={styles.freeTimeText}>Evening (5pm - 10pm)</Text>
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setAddModalVisible(true)}
        testID="button-add-activity"
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Activity</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Select
                label="Activity Type"
                placeholder="Select type"
                options={ACTIVITY_TYPES}
                value={activityType}
                onValueChange={setActivityType}
                testID="select-activity-type"
              />

              <View style={styles.durationSection}>
                <Text style={styles.durationLabel}>Duration: {duration} minutes</Text>
                <Slider
                  value={duration}
                  onValueChange={setDuration}
                  min={15}
                  max={180}
                  step={15}
                  leftLabel="15m"
                  rightLabel="3h"
                  showValue={false}
                  testID="slider-duration"
                />
              </View>

              <Slider
                label="Intensity (RPE)"
                value={intensity}
                onValueChange={setIntensity}
                min={1}
                max={10}
                step={1}
                leftLabel="Easy"
                rightLabel="Max"
                testID="slider-intensity"
              />

              <Input
                label="Notes (optional)"
                placeholder="Add any notes..."
                value={notes}
                onChangeText={setNotes}
                multiline
                testID="input-activity-notes"
              />

              <Button
                title="Add Activity"
                onPress={handleAddActivity}
                disabled={!activityType}
                testID="button-confirm-activity"
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  weekContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5F0',
  },
  weekScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dayCard: {
    width: 56,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  dayCardToday: {
    backgroundColor: '#E8F5F0',
  },
  dayCardSelected: {
    backgroundColor: '#10B981',
  },
  dayName: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  dayNameToday: {
    color: '#10B981',
  },
  dayNameSelected: {
    color: '#FFFFFF',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  dayNumberToday: {
    color: '#10B981',
  },
  dayNumberSelected: {
    color: '#FFFFFF',
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginTop: 6,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  activityCard: {
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E8F5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  activityTime: {
    fontSize: 14,
    color: '#64748B',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
  },
  freeTimeBlock: {
    backgroundColor: '#E8F5F0',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  freeTimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  freeTimeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  freeTimeText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 28,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  durationSection: {
    marginBottom: 16,
  },
  durationLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
});
