import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '@/components/ui';
import { useHealthKitSync } from '@/hooks/useHealthKitSync';

interface DataStatusItem {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  status: 'found' | 'not_found' | 'unknown';
  hint?: string;
}

export default function ConnectionsScreen() {
  const router = useRouter();
  const { 
    isConnected, 
    isSyncing, 
    lastSyncTime, 
    error, 
    dataStatus,
    connect, 
    disconnect,
    sync,
    openSettings,
  } = useHealthKitSync();

  const formatLastSync = (isoString: string | null): string => {
    if (!isoString) return 'Never';
    
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const dataItems: DataStatusItem[] = [
    { 
      id: 'sleep', 
      name: 'Sleep Analysis', 
      icon: 'moon-outline', 
      status: dataStatus.sleep,
    },
    { 
      id: 'workouts', 
      name: 'Workouts', 
      icon: 'barbell-outline', 
      status: dataStatus.workouts,
    },
    { 
      id: 'activity', 
      name: 'Activity', 
      icon: 'walk-outline', 
      status: dataStatus.activity,
    },
    { 
      id: 'nutrition', 
      name: 'Nutrition', 
      icon: 'restaurant-outline', 
      status: dataStatus.nutrition,
      hint: dataStatus.nutrition === 'not_found' 
        ? 'Connect a food logger to Apple Health' 
        : undefined,
    },
  ];

  const handleConnect = async () => {
    await connect();
  };

  const handleDisconnect = async () => {
    await disconnect();
  };

  const handleSync = async () => {
    await sync();
  };

  const handleOpenSettings = async () => {
    await openSettings();
  };

  const getStatusIcon = (status: 'found' | 'not_found' | 'unknown'): { icon: keyof typeof Ionicons.glyphMap; color: string } => {
    switch (status) {
      case 'found':
        return { icon: 'checkmark-circle', color: '#10B981' };
      case 'not_found':
        return { icon: 'alert-circle', color: '#F59E0B' };
      default:
        return { icon: 'help-circle-outline', color: '#94A3B8' };
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.title}>Health Connections</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.connectionCard}>
          <View style={styles.connectionHeader}>
            <View style={styles.connectionIcon}>
              <Ionicons name="heart" size={32} color="#FF2D55" />
            </View>
            <View style={styles.connectionInfo}>
              <Text style={styles.connectionTitle}>Apple Health</Text>
              <View style={styles.statusBadge}>
                <View style={[
                  styles.statusDot,
                  isConnected ? styles.statusConnected : styles.statusDisconnected,
                ]} />
                <Text style={[
                  styles.statusText,
                  isConnected ? styles.statusTextConnected : styles.statusTextDisconnected,
                ]}>
                  {isConnected ? 'Connected' : 'Not Connected'}
                </Text>
              </View>
            </View>
          </View>

          {Platform.OS !== 'ios' ? (
            <View style={styles.notAvailableContainer}>
              <Ionicons name="information-circle" size={20} color="#64748B" />
              <Text style={styles.notAvailableText}>
                Apple Health is only available on iOS devices
              </Text>
            </View>
          ) : !isConnected ? (
            <Button
              title="Connect Apple Health"
              onPress={handleConnect}
              style={styles.connectButton}
              testID="button-connect-health"
            />
          ) : (
            <Button
              title="Disconnect"
              onPress={handleDisconnect}
              variant="outline"
              style={styles.connectButton}
              testID="button-disconnect-health"
            />
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </Card>

        {isConnected && (
          <>
            <Text style={styles.sectionTitle}>Data Status</Text>
            <Card style={styles.dataStatusCard}>
              {dataItems.map((item, index) => {
                const statusInfo = getStatusIcon(item.status);
                return (
                  <View 
                    key={item.id}
                    style={[
                      styles.dataStatusItem,
                      index < dataItems.length - 1 && styles.dataStatusItemBorder,
                    ]}
                  >
                    <View style={styles.dataStatusLeft}>
                      <Ionicons name={item.icon} size={20} color="#64748B" />
                      <View style={styles.dataStatusInfo}>
                        <Text style={styles.dataStatusName}>{item.name}</Text>
                        {item.hint && (
                          <Text style={styles.dataStatusHint}>{item.hint}</Text>
                        )}
                      </View>
                    </View>
                    <Ionicons name={statusInfo.icon} size={20} color={statusInfo.color} />
                  </View>
                );
              })}
            </Card>

            <Card style={styles.syncCard}>
              <View style={styles.syncInfo}>
                <Ionicons name="sync-outline" size={20} color="#3B82F6" />
                <View style={styles.syncText}>
                  <Text style={styles.syncLabel}>Last Sync</Text>
                  <Text style={styles.syncTime}>{formatLastSync(lastSyncTime)}</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
                onPress={handleSync}
                disabled={isSyncing}
                testID="button-sync-now"
              >
                {isSyncing ? (
                  <ActivityIndicator size="small" color="#3B82F6" />
                ) : (
                  <Text style={styles.syncButtonText}>Sync Now</Text>
                )}
              </TouchableOpacity>
            </Card>

            <Card style={styles.settingsCard}>
              <TouchableOpacity 
                style={styles.settingsButton}
                onPress={handleOpenSettings}
              >
                <Ionicons name="settings-outline" size={20} color="#64748B" />
                <Text style={styles.settingsButtonText}>Manage in Settings</Text>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </Card>
          </>
        )}

        <Card style={styles.privacyCard}>
          <Ionicons name="shield-checkmark" size={24} color="#10B981" />
          <View style={styles.privacyText}>
            <Text style={styles.privacyTitle}>Your data is safe</Text>
            <Text style={styles.privacyDescription}>
              Health data is never used for advertising and is stored securely. Only you control who can see your data. You can disconnect at any time.
            </Text>
          </View>
        </Card>

        <View style={styles.complianceNote}>
          <Text style={styles.complianceText}>
            GrowthTrack complies with Apple's HealthKit guidelines. We only read data with your permission and never share it for marketing purposes.
          </Text>
        </View>
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
  connectionCard: {
    marginBottom: 24,
  },
  connectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  connectionIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#FFE5EA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectionInfo: {
    flex: 1,
    marginLeft: 16,
  },
  connectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusConnected: {
    backgroundColor: '#10B981',
  },
  statusDisconnected: {
    backgroundColor: '#94A3B8',
  },
  statusText: {
    fontSize: 14,
  },
  statusTextConnected: {
    color: '#10B981',
  },
  statusTextDisconnected: {
    color: '#64748B',
  },
  notAvailableContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 8,
  },
  notAvailableText: {
    flex: 1,
    fontSize: 14,
    color: '#64748B',
  },
  connectButton: {
    marginTop: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#991B1B',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
    marginLeft: 4,
  },
  dataStatusCard: {
    padding: 0,
    marginBottom: 16,
  },
  dataStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dataStatusItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5F0',
  },
  dataStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  dataStatusInfo: {
    flex: 1,
  },
  dataStatusName: {
    fontSize: 15,
    color: '#374151',
  },
  dataStatusHint: {
    fontSize: 12,
    color: '#F59E0B',
    marginTop: 2,
  },
  syncCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#EFF6FF',
  },
  syncInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  syncText: {},
  syncLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  syncTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  syncButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  syncButtonDisabled: {
    opacity: 0.7,
  },
  syncButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  settingsCard: {
    padding: 0,
    marginBottom: 24,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingsButtonText: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    backgroundColor: '#E8F5F0',
    marginBottom: 16,
  },
  privacyText: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  privacyDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  complianceNote: {
    paddingHorizontal: 8,
    paddingBottom: 24,
  },
  complianceText: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
});
