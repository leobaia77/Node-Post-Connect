import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, ProgressBar, Slider } from '@/components/ui';
import { useUpdateGuardrails } from '@/hooks/useApi';
import { api } from '@/services/api';

export default function GuardrailsScreen() {
  const [maxTrainingMinutes, setMaxTrainingMinutes] = useState(600);
  const [minSleepHours, setMinSleepHours] = useState(8);
  const [noWeightLoss, setNoWeightLoss] = useState(true);
  const router = useRouter();
  const updateGuardrails = useUpdateGuardrails();

  const handleComplete = async () => {
    try {
      await updateGuardrails.mutateAsync({
        maxWeeklyTrainingMinutes: maxTrainingMinutes,
        minNightlySleepHours: minSleepHours,
        noWeightLossMode: noWeightLoss,
      });
      
      await api.request('/api/parent/complete-onboarding', {
        method: 'POST',
        body: { onboardingComplete: true },
      });
      
      router.replace('/(tabs)');
    } catch {
    }
  };

  const handleBack = () => {
    router.back();
  };

  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ProgressBar current={3} total={3} />

        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        
        <View style={styles.header}>
          <Text style={styles.title}>Set guardrails</Text>
          <Text style={styles.subtitle}>
            Configure healthy limits to help keep your teen safe
          </Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Card style={styles.guardrailCard}>
            <View style={styles.guardrailHeader}>
              <Ionicons name="barbell-outline" size={24} color="#10B981" />
              <Text style={styles.guardrailTitle}>Weekly Training Limit</Text>
            </View>
            <Text style={styles.guardrailDescription}>
              Maximum training time per week
            </Text>
            
            <View style={styles.valueDisplay}>
              <Text style={styles.valueText}>{formatHours(maxTrainingMinutes)}</Text>
              <Text style={styles.valueLabel}>per week</Text>
            </View>
            
            <Slider
              value={maxTrainingMinutes}
              onValueChange={setMaxTrainingMinutes}
              min={120}
              max={1200}
              step={30}
              leftLabel="2h"
              rightLabel="20h"
              showValue={false}
              testID="slider-training-limit"
            />
          </Card>

          <Card style={styles.guardrailCard}>
            <View style={styles.guardrailHeader}>
              <Ionicons name="moon-outline" size={24} color="#10B981" />
              <Text style={styles.guardrailTitle}>Minimum Sleep</Text>
            </View>
            <Text style={styles.guardrailDescription}>
              Minimum nightly sleep target
            </Text>
            
            <View style={styles.valueDisplay}>
              <Text style={styles.valueText}>{minSleepHours}</Text>
              <Text style={styles.valueLabel}>hours per night</Text>
            </View>
            
            <Slider
              value={minSleepHours}
              onValueChange={setMinSleepHours}
              min={6}
              max={10}
              step={0.5}
              leftLabel="6h"
              rightLabel="10h"
              showValue={false}
              testID="slider-sleep-minimum"
            />
          </Card>

          <Card style={styles.toggleCard}>
            <View style={styles.toggleContent}>
              <View style={styles.toggleIcon}>
                <Ionicons name="shield-checkmark" size={24} color="#10B981" />
              </View>
              <View style={styles.toggleText}>
                <Text style={styles.toggleTitle}>No Weight Loss Mode</Text>
                <Text style={styles.toggleDescription}>
                  Disable weight-focused features and recommendations
                </Text>
              </View>
              <Switch
                value={noWeightLoss}
                onValueChange={setNoWeightLoss}
                trackColor={{ false: '#E2E8F0', true: '#86EFAC' }}
                thumbColor={noWeightLoss ? '#10B981' : '#94A3B8'}
                testID="switch-no-weight-loss"
              />
            </View>
          </Card>

          <Card style={styles.alertCard}>
            <Ionicons name="notifications-outline" size={24} color="#F59E0B" />
            <View style={styles.alertText}>
              <Text style={styles.alertTitle}>Safety Alerts</Text>
              <Text style={styles.alertDescription}>
                You'll automatically receive alerts when limits are exceeded or health concerns are detected.
              </Text>
            </View>
          </Card>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Complete Setup"
            onPress={handleComplete}
            loading={updateGuardrails.isPending}
            testID="button-complete"
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
  guardrailCard: {
    marginBottom: 16,
  },
  guardrailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  guardrailTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  guardrailDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    marginLeft: 36,
  },
  valueDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  valueText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#10B981',
  },
  valueLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  toggleCard: {
    marginBottom: 16,
  },
  toggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  toggleIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E8F5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleText: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  toggleDescription: {
    fontSize: 14,
    color: '#64748B',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    backgroundColor: '#FFFBEB',
  },
  alertText: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  footer: {
    paddingTop: 16,
  },
});
