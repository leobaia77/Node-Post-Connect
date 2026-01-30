import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '@/components/ui';
import { usePtRoutines, useLogPtAdherence } from '@/hooks/useApi';

interface Exercise {
  id: string;
  name: string;
  description?: string;
  durationSeconds?: number;
  repetitions?: number;
  sets?: number;
  instructions?: string[];
  completed: boolean;
}

interface Routine {
  id: string;
  name: string;
  exercises: { exercise: Exercise; orderIndex: number; customNotes?: string }[];
}

const DEFAULT_EXERCISES: Exercise[] = [
  { id: '1', name: 'Cat-Cow Stretch', sets: 1, durationSeconds: 60, completed: false },
  { id: '2', name: 'Child\'s Pose', sets: 1, durationSeconds: 45, completed: false },
  { id: '3', name: 'Pelvic Tilt', sets: 3, repetitions: 10, durationSeconds: 30, completed: false },
  { id: '4', name: 'Side Stretch', sets: 2, durationSeconds: 30, completed: false },
  { id: '5', name: 'Core Breathing', sets: 1, durationSeconds: 90, completed: false },
];

export default function PTRoutineScreen() {
  const router = useRouter();
  const { data: routinesData } = usePtRoutines();
  const logAdherence = useLogPtAdherence();

  const [exercises, setExercises] = useState<Exercise[]>(DEFAULT_EXERCISES);
  const [timerModalVisible, setTimerModalVisible] = useState(false);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (routinesData && Array.isArray(routinesData) && routinesData.length > 0) {
      const routine = routinesData[0] as Routine;
      if (routine.exercises && routine.exercises.length > 0) {
        setExercises(routine.exercises.map(e => ({
          ...e.exercise,
          completed: false,
        })));
      }
    }
  }, [routinesData]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startExercise = (exercise: Exercise) => {
    if (!sessionStartTime) setSessionStartTime(new Date());
    setActiveExercise(exercise);
    setTimeRemaining(exercise.durationSeconds || 30);
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
    if (activeExercise && currentSet < (activeExercise.sets || 1)) {
      setCurrentSet(currentSet + 1);
      setTimeRemaining(activeExercise.durationSeconds || 30);
      setIsTimerRunning(false);
    }
  };

  const finishExercise = () => {
    if (activeExercise) {
      setExercises(exercises.map(e =>
        e.id === activeExercise.id ? { ...e, completed: true } : e
      ));
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerModalVisible(false);
    setActiveExercise(null);
    setIsTimerRunning(false);
  };

  const completedCount = exercises.filter(e => e.completed).length;
  const progress = Math.round((completedCount / exercises.length) * 100);

  const handleComplete = async () => {
    if (sessionStartTime) {
      const durationMinutes = Math.round((Date.now() - sessionStartTime.getTime()) / 60000);
      const routineId = routinesData && Array.isArray(routinesData) && routinesData.length > 0
        ? (routinesData[0] as Routine).id
        : undefined;

      if (routineId) {
        await logAdherence.mutateAsync({
          routineId,
          completed: completedCount === exercises.length,
          durationMinutes,
          exercisesCompleted: exercises.filter(e => e.completed).map(e => e.id),
        });
      }
    }
    router.back();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Session Progress</Text>
            <Text style={styles.progressPercent}>{progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressSubtext}>
            {completedCount} of {exercises.length} exercises completed
          </Text>
        </Card>

        <Text style={styles.sectionTitle}>Exercises</Text>

        {exercises.map((exercise, index) => (
          <Card key={exercise.id} style={[styles.exerciseCard, exercise.completed && styles.exerciseCompleted]}>
            <TouchableOpacity
              style={styles.exerciseContent}
              onPress={() => startExercise(exercise)}
              disabled={exercise.completed}
              data-testid={`button-exercise-${index}`}
            >
              <View style={styles.exerciseLeft}>
                <View style={[styles.exerciseNumber, exercise.completed && styles.exerciseNumberCompleted]}>
                  {exercise.completed ? (
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                  ) : (
                    <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                  )}
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={[styles.exerciseName, exercise.completed && styles.exerciseNameCompleted]}>
                    {exercise.name}
                  </Text>
                  <Text style={styles.exerciseDetails}>
                    {exercise.sets && `${exercise.sets} sets`}
                    {exercise.repetitions && ` \u00b7 ${exercise.repetitions} reps`}
                    {exercise.durationSeconds && ` \u00b7 ${formatTime(exercise.durationSeconds)}`}
                  </Text>
                </View>
              </View>
              {!exercise.completed && (
                <Ionicons name="play-circle" size={32} color="#8B5CF6" />
              )}
            </TouchableOpacity>
          </Card>
        ))}

        <Button
          title={completedCount === exercises.length ? 'Complete Session' : 'Save & Exit'}
          onPress={handleComplete}
          style={styles.completeButton}
          data-testid="button-complete-session"
        />

        <View style={styles.footer} />
      </ScrollView>

      <Modal
        visible={timerModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setTimerModalVisible(false)}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>

            <Text style={styles.modalExerciseName}>{activeExercise?.name}</Text>
            {activeExercise?.sets && activeExercise.sets > 1 && (
              <Text style={styles.modalSetLabel}>Set {currentSet} of {activeExercise.sets}</Text>
            )}

            <View style={styles.timerRing}>
              <Text style={styles.timerDisplay}>{formatTime(timeRemaining)}</Text>
            </View>

            <View style={styles.timerControls}>
              <TouchableOpacity
                style={[styles.timerButton, isTimerRunning && styles.pauseButton]}
                onPress={toggleTimer}
                data-testid="button-timer-toggle"
              >
                <Ionicons name={isTimerRunning ? 'pause' : 'play'} size={32} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              {activeExercise?.sets && currentSet < activeExercise.sets ? (
                <Button
                  title="Next Set"
                  onPress={nextSet}
                  disabled={timeRemaining > 0}
                  style={styles.modalButton}
                  data-testid="button-next-set"
                />
              ) : (
                <Button
                  title="Complete Exercise"
                  onPress={finishExercise}
                  style={styles.modalButton}
                  data-testid="button-finish-exercise"
                />
              )}
            </View>
          </View>
        </SafeAreaView>
      </Modal>
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
  progressCard: {
    padding: 20,
    marginBottom: 24,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 14,
    color: '#64748B',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  exerciseCard: {
    marginBottom: 12,
    padding: 16,
  },
  exerciseCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  exerciseContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseNumberCompleted: {
    backgroundColor: '#10B981',
  },
  exerciseNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  exerciseNameCompleted: {
    color: '#059669',
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#64748B',
  },
  completeButton: {
    marginTop: 24,
    backgroundColor: '#8B5CF6',
  },
  footer: {
    height: 24,
  },
  modalSafe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalContent: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 24,
    right: 24,
    padding: 8,
  },
  modalExerciseName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSetLabel: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 32,
  },
  timerRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  timerDisplay: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1F2937',
    fontVariant: ['tabular-nums'],
  },
  timerControls: {
    marginBottom: 32,
  },
  timerButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButton: {
    backgroundColor: '#F59E0B',
  },
  modalActions: {
    width: '100%',
    paddingHorizontal: 24,
  },
  modalButton: {
    backgroundColor: '#8B5CF6',
  },
});
