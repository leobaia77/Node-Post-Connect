import { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '@/components/ui';
import { useLogSymptoms } from '@/hooks/useApi';

interface PainLocation {
  id: string;
  name: string;
  x: number;
  y: number;
  selected: boolean;
}

const PAIN_LOCATIONS: PainLocation[] = [
  { id: 'upper-back-left', name: 'Upper Back (Left)', x: 35, y: 25, selected: false },
  { id: 'upper-back-right', name: 'Upper Back (Right)', x: 65, y: 25, selected: false },
  { id: 'mid-back-left', name: 'Mid Back (Left)', x: 35, y: 40, selected: false },
  { id: 'mid-back-right', name: 'Mid Back (Right)', x: 65, y: 40, selected: false },
  { id: 'lower-back-left', name: 'Lower Back (Left)', x: 35, y: 55, selected: false },
  { id: 'lower-back-right', name: 'Lower Back (Right)', x: 65, y: 55, selected: false },
  { id: 'hip-left', name: 'Left Hip', x: 30, y: 68, selected: false },
  { id: 'hip-right', name: 'Right Hip', x: 70, y: 68, selected: false },
];

const RED_FLAGS = [
  { id: 'numbness', label: 'Numbness or tingling in legs' },
  { id: 'weakness', label: 'Weakness in legs or feet' },
  { id: 'bladder', label: 'Bladder or bowel changes' },
  { id: 'severe-pain', label: 'Severe pain not relieved by rest' },
  { id: 'breathing', label: 'Difficulty breathing' },
];

export default function SymptomsScreen() {
  const router = useRouter();
  const logSymptoms = useLogSymptoms();

  const [discomfortLevel, setDiscomfortLevel] = useState(0);
  const [painLocations, setPainLocations] = useState(PAIN_LOCATIONS);
  const [newSymptoms, setNewSymptoms] = useState('');
  const [selectedRedFlags, setSelectedRedFlags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const togglePainLocation = (id: string) => {
    setPainLocations(painLocations.map(loc =>
      loc.id === id ? { ...loc, selected: !loc.selected } : loc
    ));
  };

  const toggleRedFlag = (id: string) => {
    setSelectedRedFlags(prev =>
      prev.includes(id)
        ? prev.filter(f => f !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    await logSymptoms.mutateAsync({
      curveDiscomfortLevel: discomfortLevel,
      painLocations: painLocations.filter(l => l.selected).map(l => ({ 
        id: l.id, 
        name: l.name, 
        x: l.x, 
        y: l.y 
      })),
      newSymptoms: newSymptoms || null,
      redFlags: selectedRedFlags,
      notes: notes || null,
    });
    router.back();
  };

  const getDiscomfortLabel = (level: number) => {
    const labels = ['None', 'Mild', 'Moderate', 'Significant', 'Severe'];
    return labels[level] || 'None';
  };

  const getDiscomfortColor = (level: number) => {
    const colors = ['#10B981', '#84CC16', '#F59E0B', '#F97316', '#EF4444'];
    return colors[level] || colors[0];
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Discomfort Level</Text>
          <Text style={styles.sectionDescription}>
            How much discomfort are you feeling from your curve today?
          </Text>

          <View style={styles.discomfortSlider}>
            {[0, 1, 2, 3, 4].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.discomfortButton,
                  discomfortLevel === level && { 
                    backgroundColor: getDiscomfortColor(level),
                    borderColor: getDiscomfortColor(level),
                  }
                ]}
                onPress={() => setDiscomfortLevel(level)}
                data-testid={`button-discomfort-${level}`}
              >
                <Text style={[
                  styles.discomfortNumber,
                  discomfortLevel === level && styles.discomfortNumberActive
                ]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.discomfortLabel, { color: getDiscomfortColor(discomfortLevel) }]}>
            {getDiscomfortLabel(discomfortLevel)}
          </Text>
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Pain Locations</Text>
          <Text style={styles.sectionDescription}>
            Tap the areas where you feel discomfort (select all that apply)
          </Text>

          <View style={styles.bodyDiagram}>
            <View style={styles.bodyOutline}>
              {painLocations.map((location) => (
                <TouchableOpacity
                  key={location.id}
                  style={[
                    styles.painPoint,
                    {
                      left: `${location.x}%`,
                      top: `${location.y}%`,
                    },
                    location.selected && styles.painPointActive
                  ]}
                  onPress={() => togglePainLocation(location.id)}
                  data-testid={`button-pain-${location.id}`}
                >
                  {location.selected && (
                    <Ionicons name="close" size={12} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              ))}
              <View style={styles.spineIndicator} />
            </View>
          </View>

          {painLocations.filter(l => l.selected).length > 0 && (
            <View style={styles.selectedLocations}>
              {painLocations.filter(l => l.selected).map(location => (
                <View key={location.id} style={styles.locationTag}>
                  <Text style={styles.locationTagText}>{location.name}</Text>
                  <TouchableOpacity onPress={() => togglePainLocation(location.id)}>
                    <Ionicons name="close-circle" size={16} color="#64748B" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>New Symptoms</Text>
          <Text style={styles.sectionDescription}>
            Any new symptoms or changes you've noticed?
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="Describe any new symptoms..."
            placeholderTextColor="#94A3B8"
            value={newSymptoms}
            onChangeText={setNewSymptoms}
            multiline
            numberOfLines={3}
            data-testid="input-new-symptoms"
          />
        </Card>

        <Card style={[styles.section, styles.redFlagSection]}>
          <View style={styles.redFlagHeader}>
            <Ionicons name="warning" size={20} color="#EF4444" />
            <Text style={styles.redFlagTitle}>Red Flags</Text>
          </View>
          <Text style={styles.redFlagDescription}>
            Please check if you're experiencing any of these symptoms. They may require prompt medical attention.
          </Text>

          {RED_FLAGS.map((flag) => (
            <TouchableOpacity
              key={flag.id}
              style={[styles.redFlagItem, selectedRedFlags.includes(flag.id) && styles.redFlagItemActive]}
              onPress={() => toggleRedFlag(flag.id)}
              data-testid={`button-redflag-${flag.id}`}
            >
              <View style={[styles.checkbox, selectedRedFlags.includes(flag.id) && styles.checkboxActive]}>
                {selectedRedFlags.includes(flag.id) && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
              <Text style={styles.redFlagLabel}>{flag.label}</Text>
            </TouchableOpacity>
          ))}
        </Card>

        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Any other notes for your log..."
            placeholderTextColor="#94A3B8"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            data-testid="input-notes"
          />
        </Card>

        <Button
          title="Save Symptom Log"
          onPress={handleSubmit}
          disabled={logSymptoms.isPending}
          style={styles.submitButton}
          data-testid="button-save-symptoms"
        />

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
    padding: 24,
  },
  section: {
    padding: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 20,
  },
  discomfortSlider: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  discomfortButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  discomfortNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
  },
  discomfortNumberActive: {
    color: '#FFFFFF',
  },
  discomfortLabel: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  bodyDiagram: {
    height: 280,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodyOutline: {
    width: '80%',
    height: '90%',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
  },
  spineIndicator: {
    position: 'absolute',
    left: '50%',
    top: '15%',
    width: 4,
    height: '60%',
    backgroundColor: '#E2E8F0',
    marginLeft: -2,
    borderRadius: 2,
  },
  painPoint: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#94A3B8',
    marginLeft: -12,
    marginTop: -12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  painPointActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  selectedLocations: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  locationTagText: {
    fontSize: 12,
    color: '#475569',
  },
  textInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  redFlagSection: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  redFlagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  redFlagTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#991B1B',
  },
  redFlagDescription: {
    fontSize: 14,
    color: '#B91C1C',
    marginBottom: 16,
    lineHeight: 20,
  },
  redFlagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  redFlagItemActive: {
    backgroundColor: '#FEE2E2',
    marginHorizontal: -20,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#DC2626',
  },
  redFlagLabel: {
    flex: 1,
    fontSize: 15,
    color: '#7F1D1D',
  },
  submitButton: {
    backgroundColor: '#10B981',
  },
  footer: {
    height: 48,
  },
});
