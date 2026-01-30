import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '@/components/ui';

export default function NotificationsScreen() {
  const router = useRouter();
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [warningAlerts, setWarningAlerts] = useState(true);
  const [infoAlerts, setInfoAlerts] = useState(false);
  const [dailySummary, setDailySummary] = useState(false);
  const [weeklySummary, setWeeklySummary] = useState(true);

  const handleSave = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} testID="button-back">
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Alert Notifications</Text>
        <Card style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingHeader}>
                <View style={[styles.priorityDot, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.settingTitle}>Critical Alerts</Text>
              </View>
              <Text style={styles.settingDescription}>
                Pain flags, safety concerns
              </Text>
            </View>
            <Switch
              value={criticalAlerts}
              onValueChange={setCriticalAlerts}
              trackColor={{ false: '#E2E8F0', true: '#86EFAC' }}
              thumbColor={criticalAlerts ? '#10B981' : '#94A3B8'}
              testID="switch-critical-alerts"
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={styles.settingHeader}>
                <View style={[styles.priorityDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.settingTitle}>Warning Alerts</Text>
              </View>
              <Text style={styles.settingDescription}>
                Sleep deficit, training spikes
              </Text>
            </View>
            <Switch
              value={warningAlerts}
              onValueChange={setWarningAlerts}
              trackColor={{ false: '#E2E8F0', true: '#86EFAC' }}
              thumbColor={warningAlerts ? '#10B981' : '#94A3B8'}
              testID="switch-warning-alerts"
            />
          </View>

          <View style={[styles.settingRow, styles.settingRowLast]}>
            <View style={styles.settingInfo}>
              <View style={styles.settingHeader}>
                <View style={[styles.priorityDot, { backgroundColor: '#3B82F6' }]} />
                <Text style={styles.settingTitle}>Info Alerts</Text>
              </View>
              <Text style={styles.settingDescription}>
                Activity updates, milestones
              </Text>
            </View>
            <Switch
              value={infoAlerts}
              onValueChange={setInfoAlerts}
              trackColor={{ false: '#E2E8F0', true: '#86EFAC' }}
              thumbColor={infoAlerts ? '#10B981' : '#94A3B8'}
              testID="switch-info-alerts"
            />
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Summary Reports</Text>
        <Card style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Daily Summary</Text>
              <Text style={styles.settingDescription}>
                Evening recap of your teen's day
              </Text>
            </View>
            <Switch
              value={dailySummary}
              onValueChange={setDailySummary}
              trackColor={{ false: '#E2E8F0', true: '#86EFAC' }}
              thumbColor={dailySummary ? '#10B981' : '#94A3B8'}
              testID="switch-daily-summary"
            />
          </View>

          <View style={[styles.settingRow, styles.settingRowLast]}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Weekly Summary</Text>
              <Text style={styles.settingDescription}>
                Sunday morning week-in-review
              </Text>
            </View>
            <Switch
              value={weeklySummary}
              onValueChange={setWeeklySummary}
              trackColor={{ false: '#E2E8F0', true: '#86EFAC' }}
              thumbColor={weeklySummary ? '#10B981' : '#94A3B8'}
              testID="switch-weekly-summary"
            />
          </View>
        </Card>

        <Card style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={20} color="#F59E0B" />
          <Text style={styles.tipText}>
            We recommend keeping critical alerts on for safety, while limiting 
            info alerts to avoid notification fatigue.
          </Text>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Save Preferences"
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
    marginLeft: 4,
  },
  settingsCard: {
    padding: 0,
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  settingDescription: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginLeft: 18,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFBEB',
    padding: 16,
  },
  tipText: {
    fontSize: 14,
    color: '#92400E',
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E8F5F0',
  },
});
