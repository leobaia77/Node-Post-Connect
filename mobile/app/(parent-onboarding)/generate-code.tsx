import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  Share,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, ProgressBar } from '@/components/ui';
import { useParentProfile, useGenerateInviteCode } from '@/hooks/useApi';
import * as Clipboard from 'expo-clipboard';

export default function GenerateCodeScreen() {
  const router = useRouter();
  const { data: profile, isLoading } = useParentProfile();
  const generateCode = useGenerateInviteCode();
  const [copied, setCopied] = useState(false);

  const inviteCode = (profile as { inviteCode?: string })?.inviteCode || null;

  const handleGenerateCode = async () => {
    try {
      await generateCode.mutateAsync();
    } catch {
    }
  };

  const handleCopyCode = async () => {
    if (!inviteCode) return;
    await Clipboard.setStringAsync(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareCode = async () => {
    if (!inviteCode) return;
    try {
      await Share.share({
        message: `Join me on GrowthTrack! Use my invite code: ${inviteCode}`,
      });
    } catch {
    }
  };

  const handleContinue = () => {
    router.push('/(parent-onboarding)/supervision');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ProgressBar current={1} total={3} />
        
        <View style={styles.header}>
          <Text style={styles.title}>Invite your teen</Text>
          <Text style={styles.subtitle}>
            Share this code with your teen so they can link their account with yours
          </Text>
        </View>

        <View style={styles.content}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#10B981" />
          ) : inviteCode ? (
            <Card style={styles.codeCard} variant="elevated">
              <Text style={styles.codeLabel}>Your Invite Code</Text>
              <View style={styles.codeContainer}>
                <Text style={styles.code}>{inviteCode}</Text>
              </View>
              
              <View style={styles.codeActions}>
                <TouchableOpacity 
                  style={styles.codeAction}
                  onPress={handleCopyCode}
                  testID="button-copy-code"
                >
                  <Ionicons 
                    name={copied ? 'checkmark' : 'copy-outline'} 
                    size={24} 
                    color="#10B981" 
                  />
                  <Text style={styles.codeActionText}>
                    {copied ? 'Copied!' : 'Copy'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.codeAction}
                  onPress={handleShareCode}
                  testID="button-share-code"
                >
                  <Ionicons name="share-outline" size={24} color="#10B981" />
                  <Text style={styles.codeActionText}>Share</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ) : (
            <Card style={styles.generateCard} variant="elevated">
              <View style={styles.generateIcon}>
                <Ionicons name="key" size={48} color="#10B981" />
              </View>
              <Text style={styles.generateText}>
                Generate a code to share with your teen
              </Text>
              <Button
                title="Generate Invite Code"
                onPress={handleGenerateCode}
                loading={generateCode.isPending}
                testID="button-generate-code"
              />
            </Card>
          )}

          <Card style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#3B82F6" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>How it works</Text>
              <Text style={styles.infoDescription}>
                When your teen enters this code in their app, their account will be linked to yours. You'll be able to view their health data according to the privacy settings.
              </Text>
            </View>
          </Card>
        </View>

        <View style={styles.footer}>
          <Button
            title="Continue"
            onPress={handleContinue}
            testID="button-continue"
          />
          <TouchableOpacity 
            onPress={handleContinue} 
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>Skip - I'll invite them later</Text>
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
  header: {
    marginBottom: 32,
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
  codeLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
  },
  codeContainer: {
    backgroundColor: '#E8F5F0',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  code: {
    fontSize: 32,
    fontWeight: '700',
    color: '#10B981',
    letterSpacing: 4,
  },
  codeActions: {
    flexDirection: 'row',
    gap: 32,
  },
  codeAction: {
    alignItems: 'center',
    gap: 4,
  },
  codeActionText: {
    fontSize: 14,
    color: '#10B981',
  },
  generateCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  generateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  generateText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
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
  footer: {
    paddingTop: 16,
    gap: 12,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 16,
    color: '#64748B',
  },
});
