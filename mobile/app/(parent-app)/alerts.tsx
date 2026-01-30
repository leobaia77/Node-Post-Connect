import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '@/components/ui';

interface Alert {
  id: string;
  type: 'sleep' | 'training' | 'pain' | 'mood';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  suggestedActions?: string[];
}

const ALERT_FILTERS = ['All', 'Sleep', 'Training', 'Pain', 'Mood'];

const MOCK_ALERTS: Alert[] = [
  {
    id: '1',
    type: 'sleep',
    severity: 'warning',
    message: 'Sleep average dropped to 6.5 hours this week (target: 8 hours)',
    timestamp: '2 hours ago',
    acknowledged: false,
    suggestedActions: [
      'Talk to your teen about their sleep schedule',
      'Consider screen time limits before bedtime',
      'Discuss any stress or concerns affecting sleep',
    ],
  },
  {
    id: '2',
    type: 'pain',
    severity: 'critical',
    message: 'Pain flag raised for knee discomfort during practice',
    timestamp: '1 day ago',
    acknowledged: false,
    suggestedActions: [
      'Ask your teen about how their knee feels today',
      'Consider consulting a clinician if pain persists',
      'Review recent training load for potential overuse',
    ],
  },
  {
    id: '3',
    type: 'training',
    severity: 'info',
    message: 'Training volume increased 25% compared to last week',
    timestamp: '3 days ago',
    acknowledged: true,
  },
  {
    id: '4',
    type: 'mood',
    severity: 'info',
    message: 'Stress levels reported as elevated for 3 consecutive days',
    timestamp: '4 days ago',
    acknowledged: true,
    suggestedActions: [
      'Check in with your teen about school or social pressures',
      'Encourage relaxation or mindfulness activities',
    ],
  },
];

export default function AlertsScreen() {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'sleep': return 'moon';
      case 'training': return 'barbell';
      case 'pain': return 'medical';
      case 'mood': return 'happy';
      default: return 'alert-circle';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#EF4444';
      case 'warning': return '#F59E0B';
      case 'info': return '#3B82F6';
      default: return '#64748B';
    }
  };

  const acknowledgeAlert = (id: string) => {
    setAlerts(alerts.map(a => 
      a.id === id ? { ...a, acknowledged: true } : a
    ));
  };

  const markAllAsRead = () => {
    setAlerts(alerts.map(a => ({ ...a, acknowledged: true })));
  };

  const filteredAlerts = selectedFilter === 'All' 
    ? alerts 
    : alerts.filter(a => a.type.toLowerCase() === selectedFilter.toLowerCase());

  const unreadCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Alerts</Text>
          {unreadCount > 0 && (
            <TouchableOpacity 
              style={styles.markAllButton}
              onPress={markAllAsRead}
              testID="button-mark-all-read"
            >
              <Text style={styles.markAllText}>Mark all as read</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.subtitle}>
          {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
        </Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {ALERT_FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              selectedFilter === filter && styles.filterChipSelected,
            ]}
            onPress={() => setSelectedFilter(filter)}
            testID={`filter-${filter.toLowerCase()}`}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter && styles.filterTextSelected,
            ]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredAlerts.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Ionicons name="checkmark-circle" size={48} color="#10B981" />
            <Text style={styles.emptyTitle}>No alerts</Text>
            <Text style={styles.emptyText}>No alerts in this category</Text>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card 
              key={alert.id} 
              style={[
                styles.alertCard,
                !alert.acknowledged && styles.alertCardUnread,
              ]}
            >
              <View style={styles.alertHeader}>
                <View style={[styles.alertIcon, { backgroundColor: getSeverityColor(alert.severity) + '20' }]}>
                  <Ionicons 
                    name={getAlertIcon(alert.type) as never} 
                    size={24} 
                    color={getSeverityColor(alert.severity)} 
                  />
                </View>
                <View style={styles.alertInfo}>
                  <Text style={styles.alertMessage}>{alert.message}</Text>
                  <Text style={styles.alertTimestamp}>{alert.timestamp}</Text>
                </View>
                {!alert.acknowledged && (
                  <View style={[styles.unreadDot, { backgroundColor: getSeverityColor(alert.severity) }]} />
                )}
              </View>

              {alert.suggestedActions && alert.suggestedActions.length > 0 && (
                <TouchableOpacity
                  style={styles.actionsToggle}
                  onPress={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                  testID={`button-expand-${alert.id}`}
                >
                  <Text style={styles.actionsToggleText}>
                    {expandedAlert === alert.id ? 'Hide' : 'View'} Suggested Actions
                  </Text>
                  <Ionicons 
                    name={expandedAlert === alert.id ? 'chevron-up' : 'chevron-down'} 
                    size={16} 
                    color="#3B82F6" 
                  />
                </TouchableOpacity>
              )}

              {expandedAlert === alert.id && alert.suggestedActions && (
                <View style={styles.actionsContainer}>
                  {alert.suggestedActions.map((action, index) => (
                    <View key={index} style={styles.actionItem}>
                      <Ionicons name="arrow-forward" size={14} color="#64748B" />
                      <Text style={styles.actionText}>{action}</Text>
                    </View>
                  ))}
                </View>
              )}

              {!alert.acknowledged && (
                <TouchableOpacity
                  style={styles.acknowledgeButton}
                  onPress={() => acknowledgeAlert(alert.id)}
                  testID={`button-acknowledge-${alert.id}`}
                >
                  <Ionicons name="checkmark" size={18} color="#10B981" />
                  <Text style={styles.acknowledgeText}>Acknowledge</Text>
                </TouchableOpacity>
              )}
            </Card>
          ))
        )}

        <View style={styles.supportNote}>
          <Ionicons name="heart" size={20} color="#3B82F6" />
          <Text style={styles.supportText}>
            Remember: These alerts are tools to support your teen, not to monitor them. 
            Approach any concerns with understanding and open conversation.
          </Text>
        </View>

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
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  markAllButton: {
    padding: 8,
  },
  markAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 4,
  },
  filterContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  filterContent: {
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  filterChipSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterText: {
    fontSize: 14,
    color: '#64748B',
  },
  filterTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 0,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
  },
  alertCard: {
    marginBottom: 12,
  },
  alertCardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: '#3B82F6',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  alertIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertInfo: {
    flex: 1,
    marginLeft: 12,
  },
  alertMessage: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
  },
  alertTimestamp: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  actionsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionsToggleText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  actionsContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  acknowledgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 10,
    backgroundColor: '#E8F5F0',
    borderRadius: 8,
  },
  acknowledgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
  },
  supportNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  supportText: {
    fontSize: 14,
    color: '#64748B',
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    height: 24,
  },
});
