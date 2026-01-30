import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui';

const TRACK_OPTIONS = [
  {
    id: 'checkin',
    title: 'Daily Check-in',
    description: 'Log your energy, mood, and soreness',
    icon: 'heart',
    color: '#EF4444',
    bgColor: '#FEE2E2',
  },
  {
    id: 'sleep',
    title: 'Sleep',
    description: 'Record your sleep duration',
    icon: 'moon',
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
  },
  {
    id: 'workout',
    title: 'Workout',
    description: 'Log your training session',
    icon: 'barbell',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
  },
  {
    id: 'nutrition',
    title: 'Nutrition',
    description: 'Track your meals',
    icon: 'nutrition',
    color: '#10B981',
    bgColor: '#D1FAE5',
  },
];

export default function TrackScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Track</Text>
          <Text style={styles.subtitle}>What would you like to log?</Text>
        </View>

        <View style={styles.options}>
          {TRACK_OPTIONS.map((option) => (
            <TouchableOpacity key={option.id} testID={`button-track-${option.id}`}>
              <Card style={styles.optionCard}>
                <View style={[styles.iconContainer, { backgroundColor: option.bgColor }]}>
                  <Ionicons name={option.icon as never} size={28} color={option.color} />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#94A3B8" />
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 24,
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
  options: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    color: '#64748B',
  },
});
