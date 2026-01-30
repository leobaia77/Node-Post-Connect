import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, Input } from '@/components/ui';
import { storage } from '@/services/storage';
import { api } from '@/services/api';
import type { User } from '@/types';

export default function AccountScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const userData = await storage.getUser<User>();
    if (userData) {
      setUser(userData);
      setDisplayName(userData.displayName);
      setEmail(userData.email);
    }
  };

  const handleSave = () => {
    router.back();
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await api.logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleUnlinkTeen = () => {
    Alert.alert(
      'Unlink Teen',
      'This will remove your connection with Alex. They will no longer share data with you.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Unlink', 
          style: 'destructive',
          onPress: () => {
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} testID="button-back">
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        <Text style={styles.title}>Account Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {displayName?.charAt(0).toUpperCase() || 'P'}
            </Text>
          </View>
          <TouchableOpacity style={styles.changePhotoButton} testID="button-change-photo">
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <Input
          label="Display Name"
          value={displayName}
          onChangeText={setDisplayName}
          testID="input-display-name"
        />

        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          testID="input-email"
        />

        <TouchableOpacity style={styles.passwordLink} testID="button-change-password">
          <Text style={styles.passwordLinkText}>Change Password</Text>
          <Ionicons name="chevron-forward" size={20} color="#3B82F6" />
        </TouchableOpacity>

        <View style={styles.linkedSection}>
          <Text style={styles.linkedTitle}>Linked Teen Account</Text>
          <Card style={styles.linkedCard}>
            <View style={styles.linkedTeen}>
              <View style={styles.teenAvatar}>
                <Text style={styles.teenAvatarText}>A</Text>
              </View>
              <View style={styles.teenInfo}>
                <Text style={styles.teenName}>Alex</Text>
                <Text style={styles.teenStatus}>Connected</Text>
              </View>
              <TouchableOpacity 
                style={styles.unlinkButton}
                onPress={handleUnlinkTeen}
                testID="button-unlink-teen"
              >
                <Text style={styles.unlinkText}>Unlink</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        <View style={styles.dangerSection}>
          <Text style={styles.dangerTitle}>Account Actions</Text>
          
          <TouchableOpacity 
            style={styles.signOutButton}
            onPress={handleSignOut}
            testID="button-sign-out"
          >
            <Ionicons name="log-out-outline" size={20} color="#64748B" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Save Changes"
          onPress={handleSave}
          testID="button-save"
        />
      </View>
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  changePhotoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  changePhotoText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  passwordLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginTop: 8,
  },
  passwordLinkText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '500',
  },
  linkedSection: {
    marginTop: 32,
  },
  linkedTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 8,
  },
  linkedCard: {
    marginBottom: 24,
  },
  linkedTeen: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teenAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  teenAvatarText: {
    fontSize: 20,
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
  unlinkButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  unlinkText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
  },
  dangerSection: {
    marginTop: 16,
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  signOutText: {
    fontSize: 16,
    color: '#374151',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E8F5F0',
  },
});
