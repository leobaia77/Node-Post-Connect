import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Input, Slider } from '@/components/ui';

export default function GuardrailsScreen() {
  const router = useRouter();
  const [maxTrainingMinutes, setMaxTrainingMinutes] = useState('600');
  const [noTrainingLimit, setNoTrainingLimit] = useState(false);
  const [minSleepHours, setMinSleepHours] = useState(8);
  const [noWeightLoss, setNoWeightLoss] = useState(true);
  const [alertSleepDeficit, setAlertSleepDeficit] = useState(true);
  const [alertOvertraining, setAlertOvertraining] = useState(true);
  const [alertPainFlags, setAlertPainFlags] = useState(true);

  const handleSave = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} testID="button-back">
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.title}>Safety Guardrails</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={24} color="#3B82F6" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Supporting Healthy Limits</Text>
            <Text style={styles.infoDescription}>
              These guardrails help ensure your teen maintains healthy balance while 
              pursuing their athletic goals.
            </Text>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Training Limits</Text>
        <Card style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <Ionicons name="barbell" size={24} color="#F59E0B" />
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Max Weekly Training</Text>
              <Text style={styles.settingDescription}>
                Alerts when training exceeds this limit
              </Text>
            </View>
          </View>

          {!noTrainingLimit && (
            <View style={styles.inputRow}>
              <Input
                value={maxTrainingMinutes}
                onChangeText={setMaxTrainingMinutes}
                keyboardType="numeric"
                containerStyle={styles.minutesInput}
                testID="input-max-training"
              />
              <Text style={styles.inputUnit}>minutes/week</Text>
            </View>
          )}

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>No limit</Text>
            <Switch
              value={noTrainingLimit}
              onValueChange={setNoTrainingLimit}
              trackColor={{ false: '#E2E8F0', true: '#86EFAC' }}
              thumbColor={noTrainingLimit ? '#10B981' : '#94A3B8'}
              testID="switch-no-training-limit"
            />
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Sleep Requirements</Text>
        <Card style={styles.settingCard}>
          <View style={styles.settingHeader}>
            <Ionicons name="moon" size={24} color="#8B5CF6" />
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Minimum Nightly Sleep</Text>
              <Text style={styles.settingDescription}>
                Target sleep hours for recovery
              </Text>
            </View>
          </View>

          <View style={styles.sliderContainer}>
            <Slider
              value={minSleepHours}
              onValueChange={setMinSleepHours}
              min={7}
              max={10}
              step={0.5}
              leftLabel="7h"
              rightLabel="10h"
              testID="slider-min-sleep"
            />
            <Text style={styles.sliderValue}>{minSleepHours} hours</Text>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Nutrition Safety</Text>
        <Card style={[styles.settingCard, noWeightLoss && styles.settingCardActive]}>
          <View style={styles.settingHeader}>
            <Ionicons name="nutrition" size={24} color="#10B981" />
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>No Weight-Loss Mode</Text>
              <Text style={styles.settingDescription}>
                Prevents calorie-deficit recommendations
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

          {noWeightLoss && (
            <View style={styles.warningBox}>
              <Ionicons name="information-circle" size={16} color="#10B981" />
              <Text style={styles.warningText}>
                Recommended for teen athletes. Growing bodies need adequate fuel.
              </Text>
            </View>
          )}
        </Card>

        <Text style={styles.sectionTitle}>Alert Thresholds</Text>
        <Card style={styles.alertsCard}>
          <View style={styles.alertRow}>
            <View style={styles.alertInfo}>
              <Text style={styles.alertTitle}>Sleep Deficit Alerts</Text>
              <Text style={styles.alertDescription}>When avg sleep drops below target</Text>
            </View>
            <Switch
              value={alertSleepDeficit}
              onValueChange={setAlertSleepDeficit}
              trackColor={{ false: '#E2E8F0', true: '#86EFAC' }}
              thumbColor={alertSleepDeficit ? '#10B981' : '#94A3B8'}
              testID="switch-alert-sleep"
            />
          </View>

          <View style={styles.alertRow}>
            <View style={styles.alertInfo}>
              <Text style={styles.alertTitle}>Overtraining Alerts</Text>
              <Text style={styles.alertDescription}>Sudden spikes in training load</Text>
            </View>
            <Switch
              value={alertOvertraining}
              onValueChange={setAlertOvertraining}
              trackColor={{ false: '#E2E8F0', true: '#86EFAC' }}
              thumbColor={alertOvertraining ? '#10B981' : '#94A3B8'}
              testID="switch-alert-overtraining"
            />
          </View>

          <View style={[styles.alertRow, styles.alertRowLast]}>
            <View style={styles.alertInfo}>
              <Text style={styles.alertTitle}>Pain Flag Alerts</Text>
              <Text style={styles.alertDescription}>When pain is reported</Text>
            </View>
            <Switch
              value={alertPainFlags}
              onValueChange={setAlertPainFlags}
              trackColor={{ false: '#E2E8F0', true: '#86EFAC' }}
              thumbColor={alertPainFlags ? '#10B981' : '#94A3B8'}
              testID="switch-alert-pain"
            />
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Save Guardrails"
          onPress={handleSave}
          testID="button-save"
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
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    backgroundColor: '#EFF6FF',
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
    marginLeft: 4,
  },
  settingCard: {
    marginBottom: 24,
  },
  settingCardActive: {
    borderWidth: 2,
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  settingDescription: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  minutesInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 12,
  },
  inputUnit: {
    fontSize: 14,
    color: '#64748B',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  toggleLabel: {
    fontSize: 14,
    color: '#374151',
  },
  sliderContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  sliderValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3B82F6',
    textAlign: 'center',
    marginTop: 8,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#DCFCE7',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  warningText: {
    fontSize: 12,
    color: '#166534',
    flex: 1,
    lineHeight: 18,
  },
  alertsCard: {
    padding: 0,
    marginBottom: 24,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  alertRowLast: {
    borderBottomWidth: 0,
  },
  alertInfo: {
    flex: 1,
    marginRight: 16,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  alertDescription: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E8F5F0',
  },
});
