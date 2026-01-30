import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '@/components/ui';
import { storage } from '@/services/storage';
import type { User } from '@/types';

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await storage.getUser<User>();
    setUser(userData);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.name}>{user?.displayName || 'Athlete'}!</Text>
        </View>

        <View style={styles.quickActions}>
          <Card style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <Ionicons name="heart" size={24} color="#10B981" />
            </View>
            <Text style={styles.actionTitle}>Daily Check-in</Text>
            <Text style={styles.actionDescription}>How are you feeling today?</Text>
          </Card>

          <Card style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <Ionicons name="fitness" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.actionTitle}>Log Workout</Text>
            <Text style={styles.actionDescription}>Record your training</Text>
          </Card>
        </View>

        <Card style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Ionicons name="moon" size={24} color="#8B5CF6" />
              <Text style={styles.statValue}>--</Text>
              <Text style={styles.statLabel}>Sleep</Text>
            </View>
            
            <View style={styles.stat}>
              <Ionicons name="barbell" size={24} color="#F59E0B" />
              <Text style={styles.statValue}>--</Text>
              <Text style={styles.statLabel}>Training</Text>
            </View>
            
            <View style={styles.stat}>
              <Ionicons name="nutrition" size={24} color="#10B981" />
              <Text style={styles.statValue}>--</Text>
              <Text style={styles.statLabel}>Meals</Text>
            </View>
          </View>
        </Card>

        <Card style={styles.tipCard}>
          <Ionicons name="bulb" size={24} color="#F59E0B" />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Tip of the Day</Text>
            <Text style={styles.tipText}>
              Staying hydrated improves performance and recovery. Aim for 8 glasses of water today!
            </Text>
          </View>
        </Card>
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
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#64748B',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 24,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E8F5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  summaryCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    backgroundColor: '#FFFBEB',
    marginBottom: 24,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
});
