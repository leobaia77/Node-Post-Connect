import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { Card, Button } from '@/components/ui';
import { useRecommendations, useCompleteAction } from '@/hooks/useApi';
import type { RecommendationAction } from '@/types';

interface CompletedActions {
  [key: string]: boolean;
}

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  nutrition: 'restaurant-outline',
  training: 'barbell-outline',
  sleep: 'moon-outline',
  recovery: 'heart-outline',
  pt: 'walk-outline',
};

const PRIORITY_COLORS = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#10B981',
};

interface WhyModalContent {
  action: RecommendationAction;
  goals?: Array<{ name: string; priority: number }>;
}

export function RecommendationsCard() {
  const { data: recommendations, isLoading, error } = useRecommendations();
  const completeActionMutation = useCompleteAction();
  const [completedActions, setCompletedActions] = useState<CompletedActions>({});
  const [selectedAction, setSelectedAction] = useState<WhyModalContent | null>(null);

  useEffect(() => {
    loadCompletedActions();
  }, []);

  const loadCompletedActions = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const stored = await SecureStore.getItemAsync(`completed_actions_${today}`);
      if (stored) {
        setCompletedActions(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load completed actions:', e);
    }
  };

  const saveCompletedActions = async (actions: CompletedActions) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await SecureStore.setItemAsync(`completed_actions_${today}`, JSON.stringify(actions));
    } catch (e) {
      console.error('Failed to save completed actions:', e);
    }
  };

  const handleToggle = (actionId: string) => {
    const newCompleted = !completedActions[actionId];
    const updated = {
      ...completedActions,
      [actionId]: newCompleted,
    };
    setCompletedActions(updated);
    saveCompletedActions(updated);
    
    completeActionMutation.mutate({ actionId, completed: newCompleted });
  };

  const getCompletionStats = () => {
    if (!recommendations?.today_actions) return { completed: 0, total: 0 };
    const total = recommendations.today_actions.length;
    const completed = recommendations.today_actions.filter(a => completedActions[a.id]).length;
    return { completed, total };
  };

  const sortedActions = recommendations?.today_actions?.slice().sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  }) || [];

  const stats = getCompletionStats();

  if (isLoading) {
    return (
      <Card style={styles.card}>
        <View style={styles.header}>
          <Ionicons name="bulb" size={24} color="#10B981" />
          <Text style={styles.title}>Today's Actions</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#10B981" />
          <Text style={styles.loadingText}>Loading recommendations...</Text>
        </View>
      </Card>
    );
  }

  if (error || !recommendations) {
    return (
      <Card style={styles.card}>
        <View style={styles.header}>
          <Ionicons name="bulb" size={24} color="#10B981" />
          <Text style={styles.title}>Today's Actions</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="sparkles-outline" size={40} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>No recommendations yet</Text>
          <Text style={styles.emptyText}>
            Log some health data and check back tomorrow for personalized recommendations.
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="bulb" size={24} color="#10B981" />
          <Text style={styles.title}>Today's Actions</Text>
        </View>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>{stats.completed} of {stats.total}</Text>
        </View>
      </View>

      <View style={styles.list}>
        {sortedActions.map((action) => (
          <RecommendationItem
            key={action.id}
            action={action}
            completed={!!completedActions[action.id]}
            onToggle={() => handleToggle(action.id)}
            onShowWhy={() => setSelectedAction({ action })}
          />
        ))}
      </View>

      {recommendations.confidence_notes && (
        <View style={styles.confidenceContainer}>
          <Ionicons name="information-circle-outline" size={14} color="#94A3B8" />
          <Text style={styles.confidenceText}>{recommendations.confidence_notes}</Text>
        </View>
      )}

      <WhyThisModal
        visible={!!selectedAction}
        content={selectedAction}
        onClose={() => setSelectedAction(null)}
      />
    </Card>
  );
}

interface RecommendationItemProps {
  action: RecommendationAction;
  completed: boolean;
  onToggle: () => void;
  onShowWhy: () => void;
}

function RecommendationItem({ action, completed, onToggle, onShowWhy }: RecommendationItemProps) {
  return (
    <View style={styles.item}>
      <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[action.priority] }]} />
      
      <TouchableOpacity 
        style={styles.checkbox}
        onPress={onToggle}
        testID={`checkbox-${action.id}`}
      >
        <Ionicons 
          name={completed ? 'checkbox' : 'square-outline'} 
          size={24} 
          color={completed ? '#10B981' : '#94A3B8'} 
        />
      </TouchableOpacity>
      
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Ionicons 
            name={CATEGORY_ICONS[action.category] || 'ellipse'} 
            size={16} 
            color="#64748B" 
          />
          {action.timing && (
            <View style={styles.timingBadge}>
              <Text style={styles.timingText}>{action.timing}</Text>
            </View>
          )}
        </View>
        <Text style={[
          styles.itemText,
          completed && styles.itemTextCompleted,
        ]}>
          {action.action}
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.whyButton}
        onPress={onShowWhy}
        testID={`why-${action.id}`}
      >
        <Text style={styles.whyButtonText}>Why?</Text>
      </TouchableOpacity>
    </View>
  );
}

interface WhyThisModalProps {
  visible: boolean;
  content: WhyModalContent | null;
  onClose: () => void;
}

function WhyThisModal({ visible, content, onClose }: WhyThisModalProps) {
  if (!content) return null;
  
  const { action } = content;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Why this recommendation?</Text>
            <TouchableOpacity onPress={onClose} testID="close-why-modal">
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.actionSection}>
              <View style={styles.actionHeader}>
                <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[action.priority] }]} />
                <Ionicons 
                  name={CATEGORY_ICONS[action.category] || 'ellipse'} 
                  size={20} 
                  color="#64748B" 
                />
                <Text style={styles.categoryText}>{action.category}</Text>
              </View>
              <Text style={styles.modalActionText}>{action.action}</Text>
            </View>

            <View style={styles.rationaleSection}>
              <Text style={styles.sectionTitle}>Rationale</Text>
              <Text style={styles.rationaleText}>{action.why}</Text>
            </View>

            {action.evidence_ids.length > 0 && (
              <View style={styles.evidenceSection}>
                <Text style={styles.sectionTitle}>Based on Research</Text>
                {action.evidence_ids.map((evidenceId, index) => (
                  <View key={index} style={styles.evidenceItem}>
                    <Ionicons name="document-text-outline" size={16} color="#10B981" />
                    <Text style={styles.evidenceText}>{evidenceId}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.disclaimerSection}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#64748B" />
              <Text style={styles.disclaimerText}>
                This recommendation is based on your logged data and research-backed evidence. Always consult a healthcare provider for medical advice.
              </Text>
            </View>
          </ScrollView>
          
          <Button
            title="Got it"
            onPress={onClose}
            style={styles.modalButton}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  progressBadge: {
    backgroundColor: '#E8F5F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 24,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  list: {
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  checkbox: {
    padding: 2,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  timingBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timingText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#64748B',
  },
  itemText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  itemTextCompleted: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  whyButton: {
    padding: 4,
  },
  whyButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E8F5F0',
  },
  confidenceText: {
    flex: 1,
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
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
    maxHeight: '80%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalScroll: {
    marginBottom: 16,
  },
  actionSection: {
    marginBottom: 20,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'capitalize',
  },
  modalActionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    lineHeight: 24,
  },
  rationaleSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  rationaleText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
  },
  evidenceSection: {
    marginBottom: 20,
  },
  evidenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
  },
  evidenceText: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
  },
  disclaimerSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  modalButton: {
    marginTop: 8,
  },
});
