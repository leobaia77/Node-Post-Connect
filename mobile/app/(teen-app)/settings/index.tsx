import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui';
import { storage } from '@/services/storage';
import type { User } from '@/types';

const SETTINGS_SECTIONS = [
  {
    title: 'Preferences',
    items: [
      { id: 'goals', title: 'Goals & Priorities', icon: 'flag', route: '/(teen-app)/settings/goals' },
      { id: 'sharing', title: 'Privacy & Sharing', icon: 'lock-closed', route: '/(teen-app)/settings/sharing' },
      { id: 'notifications', title: 'Notifications', icon: 'notifications', route: '/(teen-app)/settings/notifications' },
    ],
  },
  {
    title: 'Connections',
    items: [
      { id: 'health', title: 'Apple Health', icon: 'heart', route: '/(teen-app)/settings/connections' },
    ],
  },
  {
    title: 'Your Data',
    items: [
      { id: 'export', title: 'Export My Data', icon: 'download', route: '/(teen-app)/settings/data-export' },
      { id: 'account', title: 'Account Settings', icon: 'person', route: '/(teen-app)/settings/account' },
    ],
  },
  {
    title: 'Legal',
    items: [
      { id: 'privacy', title: 'Privacy Policy', icon: 'shield-checkmark', route: '/(teen-app)/settings/privacy-policy' },
      { id: 'terms', title: 'Terms of Service', icon: 'document-text', route: '/(teen-app)/settings/terms' },
    ],
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await storage.getUser<User>();
    setUser(userData);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.displayName?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.displayName || 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email || ''}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
        </Card>

        {SETTINGS_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card style={styles.sectionCard}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.settingItem,
                    index < section.items.length - 1 && styles.settingItemBorder,
                  ]}
                  onPress={() => router.push(item.route as never)}
                  testID={`button-settings-${item.id}`}
                >
                  <View style={styles.settingLeft}>
                    <View style={styles.settingIcon}>
                      <Ionicons name={item.icon as never} size={20} color="#10B981" />
                    </View>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
                </TouchableOpacity>
              ))}
            </Card>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.version}>GrowthTrack v1.0.0</Text>
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
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 0,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    padding: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5F0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#E8F5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    color: '#374151',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  version: {
    fontSize: 12,
    color: '#94A3B8',
  },
});
