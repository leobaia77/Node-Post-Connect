import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Select, Slider } from '@/components/ui';

const WORKOUT_TYPES = [
  { label: 'Sport Practice', value: 'practice' },
  { label: 'Game/Match', value: 'game' },
  { label: 'Strength Training', value: 'strength' },
  { label: 'Cardio', value: 'cardio' },
  { label: 'Flexibility/Yoga', value: 'flexibility' },
  { label: 'Other', value: 'other' },
];

const SPORTS = [
  { label: 'Soccer', value: 'soccer' },
  { label: 'Basketball', value: 'basketball' },
  { label: 'Football', value: 'football' },
  { label: 'Baseball', value: 'baseball' },
  { label: 'Swimming', value: 'swimming' },
  { label: 'Track & Field', value: 'track' },
  { label: 'Tennis', value: 'tennis' },
  { label: 'Volleyball', value: 'volleyball' },
  { label: 'Other', value: 'other' },
];

const QUICK_TEMPLATES = [
  { name: 'Soccer Practice', duration: 90, type: 'practice', sport: 'soccer' },
  { name: 'Gym Session', duration: 45, type: 'strength', sport: null },
  { name: 'Morning Run', duration: 30, type: 'cardio', sport: null },
  { name: 'Game Day', duration: 60, type: 'game', sport: 'soccer' },
];

export default function WorkoutLogScreen() {
  const router = useRouter();
  const [workoutType, setWorkoutType] = useState<string | null>(null);
  const [sport, setSport] = useState<string | null>(null);
  const [duration, setDuration] = useState(60);
  const [rpe, setRpe] = useState(5);
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    router.back();
  };

  const applyTemplate = (template: typeof QUICK_TEMPLATES[0]) => {
    setWorkoutType(template.type);
    setDuration(template.duration);
    if (template.sport) setSport(template.sport);
  };

  const showSportSelector = workoutType === 'practice' || workoutType === 'game';

  const getRpeDescription = (value: number) => {
    if (value <= 2) return 'Very Light';
    if (value <= 4) return 'Light';
    if (value <= 6) return 'Moderate';
    if (value <= 8) return 'Hard';
    return 'Maximum Effort';
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} testID="button-back-workout">
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.title}>Log Workout</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Quick Templates</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.templatesScroll}
        >
          {QUICK_TEMPLATES.map((template, index) => (
            <TouchableOpacity
              key={index}
              style={styles.templateChip}
              onPress={() => applyTemplate(template)}
              testID={`button-template-${index}`}
            >
              <Text style={styles.templateName}>{template.name}</Text>
              <Text style={styles.templateDuration}>{template.duration}min</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Select
          label="Workout Type"
          placeholder="Select type"
          options={WORKOUT_TYPES}
          value={workoutType}
          onValueChange={setWorkoutType}
          testID="select-workout-type"
        />

        {showSportSelector && (
          <Select
            label="Sport"
            placeholder="Select sport"
            options={SPORTS}
            value={sport}
            onValueChange={setSport}
            testID="select-sport"
          />
        )}

        <View style={styles.durationSection}>
          <Text style={styles.durationLabel}>Duration: {duration} minutes</Text>
          <Slider
            value={duration}
            onValueChange={setDuration}
            min={10}
            max={180}
            step={5}
            leftLabel="10m"
            rightLabel="3h"
            showValue={false}
            testID="slider-duration"
          />
        </View>

        <View style={styles.rpeSection}>
          <View style={styles.rpeHeader}>
            <Text style={styles.rpeLabel}>RPE (Rate of Perceived Exertion)</Text>
            <Text style={styles.rpeValue}>{rpe}/10</Text>
          </View>
          <Text style={styles.rpeDescription}>{getRpeDescription(rpe)}</Text>
          <Slider
            value={rpe}
            onValueChange={setRpe}
            min={1}
            max={10}
            step={1}
            leftLabel="Easy"
            rightLabel="Max"
            showValue={false}
            testID="slider-rpe"
          />
        </View>

        <Input
          label="Notes (optional)"
          placeholder="How did it go? Any specifics..."
          value={notes}
          onChangeText={setNotes}
          multiline
          testID="input-workout-notes"
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Save Workout"
          onPress={handleSave}
          disabled={!workoutType}
          testID="button-save-workout"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5F0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  templatesScroll: {
    marginBottom: 24,
  },
  templateChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#E8F5F0',
    borderRadius: 12,
    marginRight: 12,
  },
  templateName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  templateDuration: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  durationSection: {
    marginBottom: 24,
  },
  durationLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 16,
  },
  rpeSection: {
    marginBottom: 24,
  },
  rpeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  rpeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  rpeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  rpeDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E8F5F0',
  },
});
