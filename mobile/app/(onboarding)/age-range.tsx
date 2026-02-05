import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, ProgressBar } from '@/components/ui';
import { useUpdateTeenProfile } from '@/hooks/useApi';

const AGE_RANGES = [
  { id: '13-14', label: '13-14 years', description: 'Early high school' },
  { id: '15-16', label: '15-16 years', description: 'Mid high school' },
  { id: '17-19', label: '17-19 years', description: 'Senior / early college' },
];

export default function AgeRangeScreen() {
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();
  const updateProfile = useUpdateTeenProfile();

  const handleContinue = async () => {
    if (!selected) return;
    
    try {
      await updateProfile.mutateAsync({ ageRange: selected } as never);
      router.push('/(onboarding)/goals');
    } catch {
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ProgressBar current={1} total={6} />
        
        <View style={styles.header}>
          <Text style={styles.title}>What's your age range?</Text>
          <Text style={styles.subtitle}>
            This helps us personalize your experience and recommendations
          </Text>
        </View>

        <View style={styles.options}>
          {AGE_RANGES.map((range) => (
            <TouchableOpacity
              key={range.id}
              onPress={() => setSelected(range.id)}
              testID={`option-age-${range.id}`}
            >
              <Card 
                style={[
                  styles.optionCard,
                  selected === range.id && styles.optionCardSelected,
                ]}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionText}>
                    <Text style={[
                      styles.optionLabel,
                      selected === range.id && styles.optionLabelSelected,
                    ]}>
                      {range.label}
                    </Text>
                    <Text style={styles.optionDescription}>{range.description}</Text>
                  </View>
                  {selected === range.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={!selected}
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
  header: {
    marginBottom: 32,
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
  options: {
    flex: 1,
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: '#10B981',
  },
  optionDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  footer: {
    paddingTop: 16,
  },
});
