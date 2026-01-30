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

const SUPERVISION_LEVELS = [
  {
    id: 'light',
    title: 'Light',
    description: 'Weekly summary only',
    details: [
      'Weekly health summary',
      'No access to daily logs',
      'Alerts for safety concerns only',
    ],
    icon: 'eye-off-outline',
  },
  {
    id: 'moderate',
    title: 'Moderate',
    description: 'Daily trends and alerts',
    details: [
      'Daily health trends',
      'Sleep and workout summaries',
      'All safety alerts',
      'No access to detailed notes',
    ],
    icon: 'eye-outline',
  },
  {
    id: 'full',
    title: 'Full',
    description: 'Complete visibility',
    details: [
      'All health data visible',
      'Detailed logs and notes',
      'Real-time updates',
      'All safety alerts',
    ],
    icon: 'eye',
  },
];

export default function SupervisionScreen() {
  const [selected, setSelected] = useState<string | null>('moderate');
  const router = useRouter();

  const handleContinue = () => {
    router.push('/(parent-onboarding)/guardrails');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ProgressBar current={2} total={3} />

        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        
        <View style={styles.header}>
          <Text style={styles.title}>Supervision level</Text>
          <Text style={styles.subtitle}>
            Choose how much of your teen's health data you'd like to see
          </Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.options}>
            {SUPERVISION_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.id}
                onPress={() => setSelected(level.id)}
                testID={`option-supervision-${level.id}`}
              >
                <Card 
                  style={[
                    styles.optionCard,
                    selected === level.id && styles.optionCardSelected,
                  ]}
                >
                  <View style={styles.optionHeader}>
                    <View style={[
                      styles.iconContainer,
                      selected === level.id && styles.iconContainerSelected,
                    ]}>
                      <Ionicons 
                        name={level.icon as never} 
                        size={24} 
                        color={selected === level.id ? '#10B981' : '#64748B'} 
                      />
                    </View>
                    <View style={styles.optionTitles}>
                      <Text style={[
                        styles.optionTitle,
                        selected === level.id && styles.optionTitleSelected,
                      ]}>
                        {level.title}
                      </Text>
                      <Text style={styles.optionDescription}>
                        {level.description}
                      </Text>
                    </View>
                    {selected === level.id && (
                      <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                    )}
                  </View>
                  
                  <View style={styles.detailsList}>
                    {level.details.map((detail, index) => (
                      <View key={index} style={styles.detailItem}>
                        <Ionicons 
                          name="checkmark" 
                          size={16} 
                          color={selected === level.id ? '#10B981' : '#94A3B8'} 
                        />
                        <Text style={styles.detailText}>{detail}</Text>
                      </View>
                    ))}
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>

          <Card style={styles.noteCard}>
            <Ionicons name="shield-checkmark" size={24} color="#10B981" />
            <Text style={styles.noteText}>
              Your teen can adjust their sharing preferences at any time. We encourage open communication about privacy.
            </Text>
          </Card>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={!selected}
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
    marginBottom: 16,
  },
  optionCard: {
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: '#10B981',
    backgroundColor: '#E8F5F0',
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
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
  optionTitles: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  optionTitleSelected: {
    color: '#10B981',
  },
  optionDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  detailsList: {
    marginLeft: 64,
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#64748B',
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#E8F5F0',
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  footer: {
    paddingTop: 16,
  },
});
