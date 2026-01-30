import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '@/components/ui';

interface Recommendation {
  id: string;
  text: string;
  completed: boolean;
  explanation: string;
}

interface RecommendationsCardProps {
  recommendations?: Recommendation[];
  onToggle?: (id: string) => void;
}

export function RecommendationsCard({ recommendations, onToggle }: RecommendationsCardProps) {
  const [selectedExplanation, setSelectedExplanation] = useState<Recommendation | null>(null);
  const [items, setItems] = useState<Recommendation[]>(recommendations || [
    {
      id: '1',
      text: 'Get 8+ hours of sleep tonight',
      completed: false,
      explanation: 'You\'ve been averaging 7.2 hours this week. Research shows teens need 8-10 hours for optimal recovery and growth.',
    },
    {
      id: '2',
      text: 'Hydrate before practice (64oz minimum)',
      completed: false,
      explanation: 'You have soccer practice at 4pm. Starting hydrated improves performance by up to 25%.',
    },
    {
      id: '3',
      text: 'Complete your PT stretches',
      completed: false,
      explanation: 'Your physical therapist prescribed these exercises to support your goals. Consistency is key!',
    },
    {
      id: '4',
      text: 'Log your lunch for better tracking',
      completed: true,
      explanation: 'Logging meals helps us understand your nutrition patterns and make better recommendations.',
    },
  ]);

  const handleToggle = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
    onToggle?.(id);
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="bulb" size={24} color="#10B981" />
        <Text style={styles.title}>Today's Actions</Text>
      </View>

      <View style={styles.list}>
        {items.map((item) => (
          <View key={item.id} style={styles.item}>
            <TouchableOpacity 
              style={styles.checkbox}
              onPress={() => handleToggle(item.id)}
              testID={`checkbox-${item.id}`}
            >
              <Ionicons 
                name={item.completed ? 'checkbox' : 'square-outline'} 
                size={24} 
                color={item.completed ? '#10B981' : '#94A3B8'} 
              />
            </TouchableOpacity>
            
            <Text style={[
              styles.itemText,
              item.completed && styles.itemTextCompleted,
            ]}>
              {item.text}
            </Text>
            
            <TouchableOpacity 
              style={styles.infoButton}
              onPress={() => setSelectedExplanation(item)}
              testID={`info-${item.id}`}
            >
              <Ionicons name="information-circle-outline" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <Modal
        visible={!!selectedExplanation}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedExplanation(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Why this?</Text>
              <TouchableOpacity onPress={() => setSelectedExplanation(null)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalText}>{selectedExplanation?.text}</Text>
            <Text style={styles.modalExplanation}>{selectedExplanation?.explanation}</Text>
            
            <Button
              title="Got it"
              onPress={() => setSelectedExplanation(null)}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  list: {
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    padding: 2,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  itemTextCompleted: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  infoButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 12,
  },
  modalExplanation: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalButton: {
    marginTop: 8,
  },
});
