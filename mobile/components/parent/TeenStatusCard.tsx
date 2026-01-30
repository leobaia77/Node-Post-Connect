import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui';

interface TeenStatusCardProps {
  teenName: string;
  lastActive?: string;
  sleepStatus?: 'good' | 'moderate' | 'low';
  activityStatus?: 'good' | 'moderate' | 'low';
  moodStatus?: 'good' | 'moderate' | 'low';
  sharingEnabled?: boolean;
}

export function TeenStatusCard({ 
  teenName, 
  lastActive = '2 hours ago',
  sleepStatus = 'good',
  activityStatus = 'moderate',
  moodStatus = 'good',
  sharingEnabled = true,
}: TeenStatusCardProps) {
  const getStatusColor = (status: 'good' | 'moderate' | 'low') => {
    switch (status) {
      case 'good': return '#10B981';
      case 'moderate': return '#F59E0B';
      case 'low': return '#EF4444';
    }
  };

  const getStatusIcon = (status: 'good' | 'moderate' | 'low') => {
    switch (status) {
      case 'good': return 'checkmark-circle';
      case 'moderate': return 'alert-circle';
      case 'low': return 'warning';
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{teenName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{teenName}</Text>
          <View style={styles.lastActive}>
            <Ionicons name="time-outline" size={14} color="#64748B" />
            <Text style={styles.lastActiveText}>Active {lastActive}</Text>
          </View>
        </View>
      </View>

      {sharingEnabled ? (
        <View style={styles.statusRow} testID="status-indicators-row">
          <View style={styles.statusItem} testID="status-sleep">
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(sleepStatus) }]} />
            <Ionicons name="moon" size={18} color="#64748B" />
            <Text style={styles.statusLabel}>Sleep</Text>
            <Ionicons 
              name={getStatusIcon(sleepStatus) as never} 
              size={16} 
              color={getStatusColor(sleepStatus)} 
            />
          </View>
          <View style={styles.statusItem} testID="status-activity">
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(activityStatus) }]} />
            <Ionicons name="barbell" size={18} color="#64748B" />
            <Text style={styles.statusLabel}>Activity</Text>
            <Ionicons 
              name={getStatusIcon(activityStatus) as never} 
              size={16} 
              color={getStatusColor(activityStatus)} 
            />
          </View>
          <View style={styles.statusItem} testID="status-mood">
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(moodStatus) }]} />
            <Ionicons name="happy" size={18} color="#64748B" />
            <Text style={styles.statusLabel}>Mood</Text>
            <Ionicons 
              name={getStatusIcon(moodStatus) as never} 
              size={16} 
              color={getStatusColor(moodStatus)} 
            />
          </View>
        </View>
      ) : (
        <View style={styles.privacyNote}>
          <Ionicons name="lock-closed" size={16} color="#64748B" />
          <Text style={styles.privacyText}>
            Detailed status hidden per your teen's privacy preferences
          </Text>
        </View>
      )}
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
    marginBottom: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  info: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  lastActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  lastActiveText: {
    fontSize: 14,
    color: '#64748B',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 14,
    color: '#374151',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 12,
  },
  privacyText: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
  },
});
