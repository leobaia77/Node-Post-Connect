import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '@/components/ui';

type SupervisionLevel = 'light' | 'moderate' | 'full';

interface LevelOption {
  id: SupervisionLevel;
  title: string;
  description: string;
  features: string[];
}

const SUPERVISION_LEVELS: LevelOption[] = [
  {
    id: 'light',
    title: 'Light',
    description: 'Summary data only, respect teen privacy',
    features: [
      'Weekly summary reports',
      'Safety alerts only',
      'No detailed logs visible',
    ],
  },
  {
    id: 'moderate',
    title: 'Moderate',
    description: 'Balanced oversight with key details',
    features: [
      'Daily summaries',
      'All alerts and trends',
      'Detailed data if teen allows',
    ],
  },
  {
    id: 'full',
    title: 'Full',
    description: 'Complete visibility (with teen consent)',
    features: [
      'Real-time updates',
      'Full log access',
      'All metrics visible',
    ],
  },
];

export default function SupervisionScreen() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<SupervisionLevel>('moderate');

  const handleSave = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} testID="button-back">
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.title}>Supervision Level</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#3B82F6" />
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>Finding the Right Balance</Text>
            <Text style={styles.infoDescription}>
              Choose a supervision level that works for your family. Remember, trust is 
              built through open communication, not monitoring.
            </Text>
          </View>
        </Card>

        {SUPERVISION_LEVELS.map((level) => (
          <TouchableOpacity
            key={level.id}
            onPress={() => setSelectedLevel(level.id)}
            testID={`option-${level.id}`}
          >
            <Card style={[
              styles.levelCard,
              selectedLevel === level.id && styles.levelCardSelected,
            ]}>
              <View style={styles.levelHeader}>
                <View>
                  <Text style={[
                    styles.levelTitle,
                    selectedLevel === level.id && styles.levelTitleSelected,
                  ]}>
                    {level.title}
                  </Text>
                  <Text style={styles.levelDescription}>{level.description}</Text>
                </View>
                <Ionicons 
                  name={selectedLevel === level.id ? 'radio-button-on' : 'radio-button-off'} 
                  size={24} 
                  color={selectedLevel === level.id ? '#3B82F6' : '#94A3B8'} 
                />
              </View>

              <View style={styles.featuresContainer}>
                {level.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    <Ionicons name="checkmark" size={16} color="#10B981" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        <View style={styles.noteSection}>
          <Ionicons name="shield-checkmark" size={20} color="#10B981" />
          <Text style={styles.noteText}>
            Your teen can always override detailed sharing in their privacy settings.
            Safety alerts are always shared regardless of level.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Save Changes"
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
  levelCard: {
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  levelCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  levelTitleSelected: {
    color: '#3B82F6',
  },
  levelDescription: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  featuresContainer: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
  },
  noteSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#E8F5F0',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  noteText: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E8F5F0',
  },
});
