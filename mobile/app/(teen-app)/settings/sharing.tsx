import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '@/components/ui';

interface SharingOption {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

const SHARING_OPTIONS: SharingOption[] = [
  { id: 'sleep_trends', title: 'Sleep Trends', description: 'Weekly sleep averages', enabled: true },
  { id: 'sleep_detailed', title: 'Detailed Sleep Logs', description: 'Daily sleep times', enabled: false },
  { id: 'training_trends', title: 'Training Trends', description: 'Weekly training hours', enabled: true },
  { id: 'training_detailed', title: 'Detailed Workouts', description: 'Individual sessions', enabled: true },
  { id: 'nutrition_trends', title: 'Nutrition Trends', description: 'Daily meal logging status', enabled: true },
  { id: 'nutrition_detailed', title: 'Detailed Nutrition', description: 'Individual meals', enabled: false },
  { id: 'checkins', title: 'Daily Check-ins', description: 'Energy, mood, soreness', enabled: true },
  { id: 'safety_alerts', title: 'Safety Alerts', description: 'Pain flags, overtraining', enabled: true },
];

export default function SharingScreen() {
  const router = useRouter();
  const [options, setOptions] = useState<SharingOption[]>(SHARING_OPTIONS);

  const toggleOption = (id: string) => {
    setOptions(options.map(opt => 
      opt.id === id ? { ...opt, enabled: !opt.enabled } : opt
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
        <Text style={styles.title}>Privacy & Sharing</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.infoCard}>
          <Ionicons name="shield-checkmark" size={24} color="#10B981" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>You're in control</Text>
            <Text style={styles.infoDescription}>
              Choose what health data your linked parent can see. Safety alerts are always shared to keep you safe.
            </Text>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Sharing with Parent</Text>
        <Card style={styles.optionsCard}>
          {options.map((option, index) => (
            <View 
              key={option.id}
              style={[
                styles.optionItem,
                index < options.length - 1 && styles.optionItemBorder,
              ]}
            >
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Switch
                value={option.enabled}
                onValueChange={() => toggleOption(option.id)}
                trackColor={{ false: '#E2E8F0', true: '#86EFAC' }}
                thumbColor={option.enabled ? '#10B981' : '#94A3B8'}
                disabled={option.id === 'safety_alerts'}
                testID={`switch-${option.id}`}
              />
            </View>
          ))}
        </Card>

        <Card style={styles.noteCard}>
          <Ionicons name="information-circle" size={20} color="#3B82F6" />
          <Text style={styles.noteText}>
            Safety alerts cannot be disabled as they help your parent support you when needed.
          </Text>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Save Preferences"
          onPress={handleSave}
          testID="button-save-sharing"
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
    backgroundColor: '#E8F5F0',
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
  optionsCard: {
    padding: 0,
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  optionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5F0',
  },
  optionInfo: {
    flex: 1,
    marginRight: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  optionDescription: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#EFF6FF',
    padding: 16,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E8F5F0',
  },
});
