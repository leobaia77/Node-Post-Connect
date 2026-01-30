import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, ProgressBar, Input } from '@/components/ui';
import { useAcceptInviteCode } from '@/hooks/useApi';
import { api } from '@/services/api';

export default function LinkParentScreen() {
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const acceptCode = useAcceptInviteCode();

  const handleLink = async () => {
    if (!inviteCode.trim()) return;
    
    setError(null);
    try {
      await acceptCode.mutateAsync(inviteCode.trim().toUpperCase());
      await completeOnboarding();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid invite code');
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      await api.updateTeenProfile({ onboardingComplete: true });
      router.replace('/(tabs)');
    } catch {
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ProgressBar current={6} total={6} />

        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        
        <View style={styles.header}>
          <Text style={styles.title}>Link with a parent</Text>
          <Text style={styles.subtitle}>
            Enter the invite code your parent shared with you
          </Text>
        </View>

        <View style={styles.content}>
          <Card style={styles.codeCard} variant="elevated">
            <View style={styles.codeIcon}>
              <Ionicons name="people" size={48} color="#10B981" />
            </View>
            
            <Input
              placeholder="Enter 8-character code"
              value={inviteCode}
              onChangeText={(text) => {
                setInviteCode(text.toUpperCase());
                setError(null);
              }}
              error={error || undefined}
              autoCapitalize="characters"
              maxLength={8}
              style={styles.codeInput}
              testID="input-invite-code"
            />

            <Button
              title="Link Account"
              onPress={handleLink}
              disabled={inviteCode.length < 8}
              loading={acceptCode.isPending}
              testID="button-link-parent"
            />
          </Card>

          <Card style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#3B82F6" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Why link with a parent?</Text>
              <Text style={styles.infoDescription}>
                Your parent can help monitor your health progress and set helpful guardrails to keep you safe.
              </Text>
            </View>
          </Card>

          <Card style={styles.privacyCard}>
            <Ionicons name="lock-closed" size={24} color="#10B981" />
            <View style={styles.privacyText}>
              <Text style={styles.privacyTitle}>You're in control</Text>
              <Text style={styles.privacyDescription}>
                You can choose what data to share with your parent in your privacy settings.
              </Text>
            </View>
          </Card>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip for now - I'll do this later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    padding: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  content: {
    flex: 1,
    gap: 16,
  },
  codeCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  codeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  codeInput: {
    width: '100%',
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 4,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    backgroundColor: '#EFF6FF',
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
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
  footer: {
    paddingTop: 16,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  skipText: {
    fontSize: 16,
    color: '#64748B',
  },
});
