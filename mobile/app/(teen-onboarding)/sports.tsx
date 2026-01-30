import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, ProgressBar, Input, Select } from '@/components/ui';
import { useUpdateTeenProfile } from '@/hooks/useApi';

const LEVEL_OPTIONS = [
  { label: 'Recreational', value: 'recreational' },
  { label: 'School Team', value: 'school' },
  { label: 'Club/Travel', value: 'club' },
  { label: 'Elite/Competitive', value: 'elite' },
];

interface Sport {
  id: string;
  name: string;
  level: string;
}

export default function SportsScreen() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newSportName, setNewSportName] = useState('');
  const [newSportLevel, setNewSportLevel] = useState<string | null>(null);
  const router = useRouter();
  const updateProfile = useUpdateTeenProfile();

  const addSport = () => {
    if (!newSportName.trim() || !newSportLevel) return;
    
    const newSport: Sport = {
      id: Date.now().toString(),
      name: newSportName.trim(),
      level: newSportLevel,
    };
    
    setSports([...sports, newSport]);
    setNewSportName('');
    setNewSportLevel(null);
    setIsModalVisible(false);
  };

  const removeSport = (id: string) => {
    setSports(sports.filter((s) => s.id !== id));
  };

  const handleContinue = async () => {
    try {
      await updateProfile.mutateAsync({ sports } as never);
      router.push('/(teen-onboarding)/availability');
    } catch {
    }
  };

  const handleBack = () => {
    router.back();
  };

  const getLevelLabel = (value: string) => {
    return LEVEL_OPTIONS.find((opt) => opt.value === value)?.label || value;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ProgressBar current={3} total={6} />

        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        
        <View style={styles.header}>
          <Text style={styles.title}>What sports do you play?</Text>
          <Text style={styles.subtitle}>
            Add your sports and competition level
          </Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {sports.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="football-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyText}>No sports added yet</Text>
              <Text style={styles.emptySubtext}>Tap the button below to add your first sport</Text>
            </Card>
          ) : (
            <View style={styles.sportsList}>
              {sports.map((sport) => (
                <Card key={sport.id} style={styles.sportCard}>
                  <View style={styles.sportContent}>
                    <View>
                      <Text style={styles.sportName}>{sport.name}</Text>
                      <Text style={styles.sportLevel}>{getLevelLabel(sport.level)}</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => removeSport(sport.id)}
                      testID={`button-remove-sport-${sport.id}`}
                    >
                      <Ionicons name="close-circle" size={24} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
            </View>
          )}
          
          <Button
            title="Add Sport"
            onPress={() => setIsModalVisible(true)}
            variant="secondary"
            style={styles.addButton}
            testID="button-add-sport"
          />
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={sports.length === 0 ? 'Skip' : 'Continue'}
            onPress={handleContinue}
            loading={updateProfile.isPending}
            testID="button-continue"
          />
        </View>

        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Sport</Text>
                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>

              <Input
                label="Sport Name"
                placeholder="e.g., Basketball, Soccer"
                value={newSportName}
                onChangeText={setNewSportName}
                testID="input-sport-name"
              />

              <Select
                label="Level"
                placeholder="Select your level"
                options={LEVEL_OPTIONS}
                value={newSportLevel}
                onValueChange={setNewSportLevel}
                testID="select-sport-level"
              />

              <Button
                title="Add Sport"
                onPress={addSport}
                disabled={!newSportName.trim() || !newSportLevel}
                testID="button-confirm-add-sport"
              />
            </View>
          </View>
        </Modal>
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
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
  },
  sportsList: {
    gap: 12,
  },
  sportCard: {
    padding: 16,
  },
  sportContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sportName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  sportLevel: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  addButton: {
    marginTop: 16,
  },
  footer: {
    paddingTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
});
