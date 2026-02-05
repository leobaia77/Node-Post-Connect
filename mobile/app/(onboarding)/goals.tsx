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
import { Button, Card, ProgressBar, Slider } from '@/components/ui';
import { useUpdateTeenGoals } from '@/hooks/useApi';

const GOALS = [
  { id: 'growth', name: 'General healthy growth', icon: 'leaf' },
  { id: 'muscle', name: 'Muscle growth', icon: 'barbell' },
  { id: 'bone', name: 'Bone health', icon: 'fitness' },
  { id: 'scoliosis', name: 'Scoliosis support', icon: 'body' },
  { id: 'athletic', name: 'Athletic performance', icon: 'trophy' },
];

interface GoalWithPriority {
  id: string;
  name: string;
  priority: number;
}

export default function GoalsScreen() {
  const [selectedGoals, setSelectedGoals] = useState<GoalWithPriority[]>([]);
  const router = useRouter();
  const updateGoals = useUpdateTeenGoals();

  const toggleGoal = (goalId: string) => {
    const exists = selectedGoals.find((g) => g.id === goalId);
    if (exists) {
      setSelectedGoals(selectedGoals.filter((g) => g.id !== goalId));
    } else {
      const goal = GOALS.find((g) => g.id === goalId);
      if (goal) {
        setSelectedGoals([...selectedGoals, { id: goal.id, name: goal.name, priority: 5 }]);
      }
    }
  };

  const updatePriority = (goalId: string, priority: number) => {
    setSelectedGoals(
      selectedGoals.map((g) => (g.id === goalId ? { ...g, priority } : g))
    );
  };

  const handleContinue = async () => {
    if (selectedGoals.length === 0) return;
    
    try {
      await updateGoals.mutateAsync(selectedGoals);
      router.push('/(onboarding)/sports');
    } catch {
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ProgressBar current={2} total={6} />

        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        
        <View style={styles.header}>
          <Text style={styles.title}>What are your goals?</Text>
          <Text style={styles.subtitle}>
            Select all that apply and set priorities
          </Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.options}>
            {GOALS.map((goal) => {
              const isSelected = selectedGoals.some((g) => g.id === goal.id);
              const selectedGoal = selectedGoals.find((g) => g.id === goal.id);
              
              return (
                <View key={goal.id}>
                  <TouchableOpacity
                    onPress={() => toggleGoal(goal.id)}
                    testID={`option-goal-${goal.id}`}
                  >
                    <Card 
                      style={[
                        styles.optionCard,
                        isSelected && styles.optionCardSelected,
                      ]}
                    >
                      <View style={styles.optionContent}>
                        <View style={[
                          styles.iconContainer,
                          isSelected && styles.iconContainerSelected,
                        ]}>
                          <Ionicons 
                            name={goal.icon as never} 
                            size={24} 
                            color={isSelected ? '#10B981' : '#64748B'} 
                          />
                        </View>
                        <Text style={[
                          styles.optionLabel,
                          isSelected && styles.optionLabelSelected,
                        ]}>
                          {goal.name}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                        )}
                      </View>
                    </Card>
                  </TouchableOpacity>
                  
                  {isSelected && selectedGoal && (
                    <View style={styles.prioritySlider}>
                      <Slider
                        label="Priority"
                        value={selectedGoal.priority}
                        onValueChange={(val) => updatePriority(goal.id, val)}
                        min={1}
                        max={10}
                        leftLabel="Low"
                        rightLabel="High"
                        testID={`slider-priority-${goal.id}`}
                      />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={selectedGoals.length === 0}
            loading={updateGoals.isPending}
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
  options: {
    gap: 12,
  },
  optionCard: {
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: '#10B981',
    backgroundColor: '#E8F5F0',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerSelected: {
    backgroundColor: '#DCFCE7',
  },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  optionLabelSelected: {
    color: '#10B981',
  },
  prioritySlider: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  footer: {
    paddingTop: 16,
  },
});
