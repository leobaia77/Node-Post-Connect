import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui';
import { storage } from '@/services/storage';
import type { User } from '@/types';

const SETTINGS_SECTIONS = [
  {
    title: 'Oversight',
    items: [
      { id: 'supervision', title: 'Supervision Level', icon: 'eye', route: '/(parent-app)/settings/supervision' },
      { id: 'guardrails', title: 'Safety Guardrails', icon: 'shield-checkmark', route: '/(parent-app)/settings/guardrails' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { id: 'notifications', title: 'Notifications', icon: 'notifications', route: '/(parent-app)/settings/notifications' },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'account', title: 'Account Settings', icon: 'person', route: '/(parent-app)/settings/account' },
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
        <TouchableOpacity 
          style={styles.profileCard}
          onPress={() => router.push('/(parent-app)/settings/account')}
          testID="button-profile"
        >
          <Card style={styles.profileCardInner}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.displayName?.charAt(0).toUpperCase() || 'P'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.displayName || 'Parent'}</Text>
              <Text style={styles.profileRole}>Parent Account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </Card>
        </TouchableOpacity>

        <Card style={styles.linkedTeenCard}>
          <View style={styles.linkedHeader}>
            <Ionicons name="people" size={20} color="#3B82F6" />
            <Text style={styles.linkedTitle}>Linked Teen</Text>
          </View>
          <View style={styles.linkedTeen}>
            <View style={styles.teenAvatar}>
              <Text style={styles.teenAvatarText}>A</Text>
            </View>
            <View style={styles.teenInfo}>
              <Text style={styles.teenName}>Alex</Text>
              <Text style={styles.teenStatus}>Connected</Text>
            </View>
            <View style={styles.supervisionBadge}>
              <Text style={styles.supervisionText}>Moderate</Text>
            </View>
          </View>
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
                      <Ionicons name={item.icon as never} size={20} color="#3B82F6" />
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
    marginBottom: 16,
  },
  profileCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
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
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  profileRole: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  linkedTeenCard: {
    marginBottom: 24,
    backgroundColor: '#EFF6FF',
  },
  linkedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  linkedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  linkedTeen: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teenAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teenAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  teenInfo: {
    flex: 1,
    marginLeft: 12,
  },
  teenName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  teenStatus: {
    fontSize: 12,
    color: '#10B981',
  },
  supervisionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#DBEAFE',
    borderRadius: 16,
  },
  supervisionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#3B82F6',
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
    backgroundColor: '#EFF6FF',
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
