import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '@/components/ui';

interface HealthPermission {
  id: string;
  name: string;
  enabled: boolean;
}

export default function ConnectionsScreen() {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [permissions, setPermissions] = useState<HealthPermission[]>([
    { id: 'sleep', name: 'Sleep Analysis', enabled: true },
    { id: 'workouts', name: 'Workouts', enabled: true },
    { id: 'activity', name: 'Activity', enabled: true },
    { id: 'heart_rate', name: 'Heart Rate', enabled: false },
  ]);

  const togglePermission = (id: string) => {
    setPermissions(permissions.map(p => 
      p.id === id ? { ...p, enabled: !p.enabled } : p
    ));
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

          {!isConnected ? (
            <Button
              title="Connect Apple Health"
              onPress={() => setIsConnected(true)}
              style={styles.connectButton}
              testID="button-connect-health"
            />
          ) : (
            <Button
              title="Disconnect"
              onPress={() => setIsConnected(false)}
              variant="outline"
              style={styles.connectButton}
              testID="button-disconnect-health"
            />
          )}
        </Card>

        {isConnected && (
          <>
            <Text style={styles.sectionTitle}>Data Permissions</Text>
            <Card style={styles.permissionsCard}>
              {permissions.map((permission, index) => (
                <View 
                  key={permission.id}
                  style={[
                    styles.permissionItem,
                    index < permissions.length - 1 && styles.permissionItemBorder,
                  ]}
                >
                  <Text style={styles.permissionName}>{permission.name}</Text>
                  <Switch
                    value={permission.enabled}
                    onValueChange={() => togglePermission(permission.id)}
                    trackColor={{ false: '#E2E8F0', true: '#86EFAC' }}
                    thumbColor={permission.enabled ? '#10B981' : '#94A3B8'}
                    testID={`switch-permission-${permission.id}`}
                  />
                </View>
              ))}
            </Card>

            <Card style={styles.infoCard}>
              <Ionicons name="sync" size={20} color="#3B82F6" />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Last Sync</Text>
                <Text style={styles.infoDescription}>Today at 10:30 AM</Text>
              </View>
              <TouchableOpacity style={styles.syncButton}>
                <Text style={styles.syncButtonText}>Sync Now</Text>
              </TouchableOpacity>
            </Card>
          </>
        )}

        <Card style={styles.privacyCard}>
          <Ionicons name="shield-checkmark" size={24} color="#10B981" />
          <View style={styles.privacyText}>
            <Text style={styles.privacyTitle}>Your data is safe</Text>
            <Text style={styles.privacyDescription}>
              Health data is never used for advertising and is stored securely. Only you control who can see your data.
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
  connectButton: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
    marginLeft: 4,
  },
  permissionsCard: {
    padding: 0,
    marginBottom: 16,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  permissionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5F0',
  },
  permissionName: {
    fontSize: 16,
    color: '#374151',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    backgroundColor: '#EFF6FF',
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 12,
    color: '#64748B',
  },
  infoDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  syncButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
  },
  syncButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    backgroundColor: '#E8F5F0',
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
});
