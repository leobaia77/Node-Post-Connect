import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Slider } from '@/components/ui';

interface Goal {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  priority: number;
}

const GOALS: Goal[] = [
  { id: 'growth', name: 'General healthy growth', icon: 'leaf', enabled: true, priority: 8 },
  { id: 'muscle', name: 'Muscle growth', icon: 'barbell', enabled: true, priority: 6 },
  { id: 'bone', name: 'Bone health', icon: 'fitness', enabled: false, priority: 5 },
  { id: 'scoliosis', name: 'Scoliosis support', icon: 'body', enabled: false, priority: 5 },
  { id: 'athletic', name: 'Athletic performance', icon: 'trophy', enabled: true, priority: 9 },
];

export default function GoalsScreen() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>(GOALS);

  const toggleGoal = (id: string) => {
    setGoals(goals.map(g => 
      g.id === id ? { ...g, enabled: !g.enabled } : g
    ));
  };

  const updatePriority = (id: string, priority: number) => {
    setGoals(goals.map(g => 
      g.id === id ? { ...g, priority } : g
    ));
  };

  const handleSave = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.title}>Goals & Priorities</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          Select your goals and adjust their priority to personalize your recommendations
        </Text>

        {goals.map((goal) => (
          <Card key={goal.id} style={[
            styles.goalCard,
            goal.enabled && styles.goalCardEnabled,
          ]}>
            <TouchableOpacity
              style={styles.goalHeader}
              onPress={() => toggleGoal(goal.id)}
            >
              <View style={[
                styles.goalIcon,
                goal.enabled && styles.goalIconEnabled,
              ]}>
                <Ionicons 
                  name={goal.icon as never} 
                  size={24} 
                  color={goal.enabled ? '#10B981' : '#64748B'} 
                />
              </View>
              <Text style={[
                styles.goalName,
                goal.enabled && styles.goalNameEnabled,
              ]}>
                {goal.name}
              </Text>
              <Ionicons 
                name={goal.enabled ? 'checkbox' : 'square-outline'} 
                size={24} 
                color={goal.enabled ? '#10B981' : '#94A3B8'} 
              />
            </TouchableOpacity>

            {goal.enabled && (
              <View style={styles.prioritySection}>
                <Slider
                  label="Priority"
                  value={goal.priority}
                  onValueChange={(val) => updatePriority(goal.id, val)}
                  min={1}
                  max={10}
                  step={1}
                  leftLabel="Low"
                  rightLabel="High"
                />
              </View>
            )}
          </Card>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Save Changes"
          onPress={handleSave}
          testID="button-save-goals"
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
  description: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 24,
  },
  goalCard: {
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalCardEnabled: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalIconEnabled: {
    backgroundColor: '#DCFCE7',
  },
  goalName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  goalNameEnabled: {
    color: '#10B981',
  },
  prioritySection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E8F5F0',
  },
});
