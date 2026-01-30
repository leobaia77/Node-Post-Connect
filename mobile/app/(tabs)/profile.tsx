import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { storage } from '@/services/storage';
import type { User } from '@/types';

const SETTINGS_OPTIONS = [
  { id: 'account', title: 'Account Settings', icon: 'person-outline' },
  { id: 'privacy', title: 'Privacy & Sharing', icon: 'lock-closed-outline' },
  { id: 'notifications', title: 'Notifications', icon: 'notifications-outline' },
  { id: 'health', title: 'Health Connections', icon: 'heart-outline' },
  { id: 'help', title: 'Help & Support', icon: 'help-circle-outline' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await storage.getUser<User>();
    setUser(userData);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.displayName?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.displayName || 'User'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {user?.role === 'teen' ? 'Teen Athlete' : 'Parent'}
            </Text>
          </View>
        </View>

        <View style={styles.settings}>
          {SETTINGS_OPTIONS.map((option) => (
            <TouchableOpacity key={option.id} testID={`button-settings-${option.id}`}>
              <Card style={styles.settingCard}>
                <Ionicons name={option.icon as never} size={24} color="#64748B" />
                <Text style={styles.settingTitle}>{option.title}</Text>
                <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Sign Out"
          onPress={handleLogout}
          variant="outline"
          style={styles.logoutButton}
          testID="button-logout"
        />

        <Text style={styles.version}>Version 1.0.0</Text>
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
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#E8F5F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  settings: {
    gap: 8,
    marginBottom: 24,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
  },
  settingTitle: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  logoutButton: {
    marginBottom: 16,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 24,
  },
});
