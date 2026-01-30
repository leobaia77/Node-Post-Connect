import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui';

const LOG_OPTIONS = [
  {
    id: 'meal',
    title: 'Log Meal',
    description: 'Track your nutrition',
    icon: 'nutrition',
    color: '#10B981',
    bgColor: '#D1FAE5',
    route: '/(teen-app)/log/meal-log',
  },
  {
    id: 'workout',
    title: 'Log Workout',
    description: 'Record training sessions',
    icon: 'barbell',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
    route: '/(teen-app)/log/workout-log',
  },
  {
    id: 'pt',
    title: 'Log PT/Brace',
    description: 'Track PT exercises',
    icon: 'fitness',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    route: '/(teen-app)/log/pt-log',
  },
  {
    id: 'checkin',
    title: 'Daily Check-in',
    description: 'How are you feeling?',
    icon: 'heart',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    route: '/(teen-app)/log/checkin',
  },
];

export default function LogScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Log</Text>
        <Text style={styles.subtitle}>What would you like to track?</Text>
      </View>

      <View style={styles.grid}>
        {LOG_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.gridItem}
            onPress={() => router.push(option.route as never)}
            testID={`button-log-${option.id}`}
          >
            <Card style={styles.optionCard}>
              <View style={[styles.iconContainer, { backgroundColor: option.bgColor }]}>
                <Ionicons name={option.icon as never} size={32} color={option.color} />
              </View>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.recentSection}>
        <Text style={styles.recentTitle}>Recent Logs</Text>
        <Card style={styles.emptyCard}>
          <Ionicons name="time-outline" size={32} color="#94A3B8" />
          <Text style={styles.emptyText}>No recent logs today</Text>
        </Card>
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  gridItem: {
    width: '48%',
  },
  optionCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  recentSection: {
    padding: 24,
    flex: 1,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 12,
  },
});
