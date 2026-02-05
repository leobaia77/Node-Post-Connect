import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Input } from '@/components/ui';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  duration: number;
  completed: boolean;
}

const MOCK_ROUTINE: Exercise[] = [
  { id: '1', name: 'Hip Flexor Stretch', sets: 3, duration: 30, completed: false },
  { id: '2', name: 'Core Stability', sets: 3, duration: 45, completed: false },
  { id: '3', name: 'Single Leg Balance', sets: 2, duration: 60, completed: false },
  { id: '4', name: 'Band Walks', sets: 3, duration: 30, completed: false },
];

export default function PTLogScreen() {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>(MOCK_ROUTINE);
  const [braceMinutes, setBraceMinutes] = useState('');
  const [notes, setNotes] = useState('');
  const [timerModalVisible, setTimerModalVisible] = useState(false);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const toggleExercise = (id: string) => {
    setExercises(exercises.map(ex => 
      ex.id === id ? { ...ex, completed: !ex.completed } : ex
    ));
  };

  const startTimer = (exercise: Exercise) => {
    setActiveExercise(exercise);
    setTimeRemaining(exercise.duration);
    setCurrentSet(1);
    setTimerModalVisible(true);
    setIsTimerRunning(false);
  };

  const toggleTimer = () => {
    if (isTimerRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsTimerRunning(false);
    } else {
      setIsTimerRunning(true);
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const nextSet = () => {
    if (activeExercise && currentSet < activeExercise.sets) {
      setCurrentSet(currentSet + 1);
      setTimeRemaining(activeExercise.duration);
      setIsTimerRunning(false);
    }
  };

  const finishExercise = () => {
    if (activeExercise) {
      toggleExercise(activeExercise.id);
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerModalVisible(false);
    setActiveExercise(null);
    setIsTimerRunning(false);
  };

  const completedCount = exercises.filter(e => e.completed).length;
  const progress = Math.round((completedCount / exercises.length) * 100);

  const handleSave = () => {
    router.back();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} testID="button-back-pt">
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.title}>PT / Brace Log</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Today's PT Routine</Text>
            <Text style={styles.progressPercent} testID="text-progress-percent">{progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressSubtext} testID="text-progress-count">
            {completedCount} of {exercises.length} exercises completed
          </Text>
        </Card>

        <Text style={styles.sectionTitle}>Exercises</Text>
        {exercises.map((exercise) => (
          <TouchableOpacity
            key={exercise.id}
            onPress={() => toggleExercise(exercise.id)}
            testID={`exercise-${exercise.id}`}
          >
            <Card style={[
              styles.exerciseCard,
              exercise.completed && styles.exerciseCardCompleted,
            ]}>
              <View style={styles.exerciseContent}>
                <Ionicons 
                  name={exercise.completed ? 'checkbox' : 'square-outline'} 
                  size={28} 
                  color={exercise.completed ? '#10B981' : '#94A3B8'} 
                />
                <View style={styles.exerciseInfo}>
                  <Text style={[
                    styles.exerciseName,
                    exercise.completed && styles.exerciseNameCompleted,
                  ]}>
                    {exercise.name}
                  </Text>
                  <Text style={styles.exerciseDetails}>
                    {exercise.sets} sets x {exercise.duration}s
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.timerButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    startTimer(exercise);
                  }}
                  testID={`button-timer-${exercise.id}`}
                >
                  <Ionicons name="timer-outline" size={24} color="#10B981" />
                </TouchableOpacity>
              </View>
            </Card>
          </TouchableOpacity>
        ))}

        <View style={styles.braceSection}>
          <Text style={styles.sectionTitle}>Brace Wearing (if applicable)</Text>
          <Card style={styles.braceCard}>
            <View style={styles.braceInput}>
              <Ionicons name="time-outline" size={24} color="#3B82F6" />
              <Input
                placeholder="0"
                value={braceMinutes}
                onChangeText={setBraceMinutes}
                keyboardType="numeric"
                containerStyle={styles.braceInputField}
                testID="input-brace-minutes"
              />
              <Text style={styles.braceUnit}>minutes today</Text>
            </View>
          </Card>
        </View>

        <Input
          label="Notes (optional)"
          placeholder="How did it feel? Any pain or discomfort?"
          value={notes}
          onChangeText={setNotes}
          multiline
          testID="input-pt-notes"
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Complete Routine"
          onPress={handleSave}
          testID="button-complete-routine"
        />
      </View>

      <Modal
        visible={timerModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTimerModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{activeExercise?.name}</Text>
              <TouchableOpacity 
                onPress={() => {
                  if (intervalRef.current) clearInterval(intervalRef.current);
                  setTimerModalVisible(false);
                }}
                testID="button-close-timer"
              >
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <Text style={styles.setIndicator} testID="text-set-indicator">
              Set {currentSet} of {activeExercise?.sets}
            </Text>

            <View style={styles.timerDisplay}>
              <Text style={styles.timerText} testID="text-timer-display">{formatTime(timeRemaining)}</Text>
            </View>

            <View style={styles.timerControls}>
              <TouchableOpacity 
                style={styles.timerControlButton}
                onPress={toggleTimer}
                testID="button-toggle-timer"
              >
                <Ionicons 
                  name={isTimerRunning ? 'pause' : 'play'} 
                  size={32} 
                  color="#FFFFFF" 
                />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.timerControlButton, 
                  styles.timerSecondaryButton,
                  timeRemaining > 0 && styles.timerButtonDisabled,
                ]}
                onPress={nextSet}
                disabled={timeRemaining > 0 || !activeExercise || currentSet >= activeExercise.sets}
                testID="button-next-set"
              >
                <Text style={styles.timerButtonText}>Next Set</Text>
              </TouchableOpacity>
            </View>

            {currentSet >= (activeExercise?.sets || 0) && timeRemaining === 0 && (
              <Button
                title="Done - Mark Complete"
                onPress={finishExercise}
                style={styles.finishButton}
                testID="button-finish-exercise"
              />
            )}
          </View>
        </View>
      </Modal>
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
  progressCard: {
    marginBottom: 24,
    backgroundColor: '#E8F5F0',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 12,
    color: '#64748B',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  exerciseCard: {
    marginBottom: 8,
  },
  exerciseCardCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  exerciseContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  exerciseNameCompleted: {
    color: '#10B981',
    textDecorationLine: 'line-through',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  timerButton: {
    padding: 8,
  },
  braceSection: {
    marginTop: 24,
  },
  braceCard: {
    marginBottom: 24,
  },
  braceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  braceInputField: {
    flex: 1,
    marginBottom: 0,
  },
  braceUnit: {
    fontSize: 14,
    color: '#64748B',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E8F5F0',
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
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  setIndicator: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 24,
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 32,
  },
  timerText: {
    fontSize: 64,
    fontWeight: '700',
    color: '#10B981',
  },
  timerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  timerControlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerSecondaryButton: {
    backgroundColor: '#3B82F6',
    width: 'auto',
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  timerButtonDisabled: {
    opacity: 0.5,
  },
  timerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  finishButton: {
    marginTop: 16,
  },
});
