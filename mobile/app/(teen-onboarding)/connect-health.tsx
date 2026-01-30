import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, ProgressBar } from '@/components/ui';
import { useHealthKitSync } from '@/hooks/useHealthKitSync';

const DATA_TYPES = [
  { id: 'sleep', name: 'Sleep Analysis', icon: 'moon-outline' as const, description: 'Bedtime, wake time, sleep quality' },
  { id: 'workouts', name: 'Workouts', icon: 'barbell-outline' as const, description: 'Exercise sessions, duration, type' },
  { id: 'activity', name: 'Activity', icon: 'walk-outline' as const, description: 'Steps, active energy, move minutes' },
  { id: 'nutrition', name: 'Nutrition', icon: 'restaurant-outline' as const, description: 'Calories, protein, carbs, fat (if logged)' },
];

export default function ConnectHealthScreen() {
  const router = useRouter();
  const { connect, isConnected, isSyncing, error } = useHealthKitSync();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);

  const handleConnect = async () => {
    if (Platform.OS !== 'ios') {
      router.push('/(teen-onboarding)/link-parent');
      return;
    }

    setShowPermissionPrompt(true);
  };

  const handleConfirmConnect = async () => {
    setShowPermissionPrompt(false);
    setIsConnecting(true);
    
    const success = await connect();
    setIsConnecting(false);
    
    if (success) {
      router.push('/(teen-onboarding)/link-parent');
    }
  };

  const handleSkip = () => {
    router.push('/(teen-onboarding)/link-parent');
  };

  const handleBack = () => {
    router.back();
  };

  if (showPermissionPrompt) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <TouchableOpacity onPress={() => setShowPermissionPrompt(false)} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#64748B" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Review Permissions</Text>
            <Text style={styles.subtitle}>
              GrowthTrack will request read-only access to the following data:
            </Text>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.permissionsList}>
              {DATA_TYPES.map((dataType) => (
                <View key={dataType.id} style={styles.permissionItem}>
                  <View style={styles.permissionIcon}>
                    <Ionicons name={dataType.icon} size={24} color="#10B981" />
                  </View>
                  <View style={styles.permissionInfo}>
                    <Text style={styles.permissionName}>{dataType.name}</Text>
                    <Text style={styles.permissionDescription}>{dataType.description}</Text>
                  </View>
                </View>
              ))}
            </View>

            <Card style={styles.privacyCard}>
              <Ionicons name="shield-checkmark" size={24} color="#10B981" />
              <View style={styles.privacyText}>
                <Text style={styles.privacyTitle}>Privacy Promise</Text>
                <Text style={styles.privacyDescription}>
                  Your health data is encrypted and never used for advertising. We only read data - we never write to your Health app. You can disconnect at any time in settings.
                </Text>
              </View>
            </Card>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Continue to Connect"
              onPress={handleConfirmConnect}
              testID="button-confirm-health"
            />
            <TouchableOpacity onPress={() => setShowPermissionPrompt(false)} style={styles.skipButton}>
              <Text style={styles.skipText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ProgressBar current={5} total={6} />

        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#64748B" />
        </TouchableOpacity>
        
        <View style={styles.header}>
          <Text style={styles.title}>Connect Apple Health</Text>
          <Text style={styles.subtitle}>
            Automatically sync your health data for better insights and personalized recommendations
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Card style={styles.healthCard} variant="elevated">
            <View style={styles.healthIcon}>
              <Ionicons name="heart" size={48} color="#FF2D55" />
            </View>
            <Text style={styles.healthTitle}>Apple Health</Text>
            <Text style={styles.healthDescription}>
              We'll import your sleep, activity, and workout data to provide personalized recommendations
            </Text>
          </Card>

          <View style={styles.benefits}>
            <Text style={styles.benefitsTitle}>What we'll read:</Text>
            
            {DATA_TYPES.map((dataType) => (
              <View key={dataType.id} style={styles.benefitItem}>
                <Ionicons name={dataType.icon} size={24} color="#10B981" />
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitText}>{dataType.name}</Text>
                  <Text style={styles.benefitDescription}>{dataType.description}</Text>
                </View>
              </View>
            ))}
          </View>

          <Card style={styles.privacyCard}>
            <Ionicons name="shield-checkmark" size={24} color="#10B981" />
            <View style={styles.privacyText}>
              <Text style={styles.privacyTitle}>Your data is safe</Text>
              <Text style={styles.privacyDescription}>
                Health data is never used for advertising and is stored securely. Only you control who can see your data.
              </Text>
            </View>
          </Card>

          {error && (
            <Card style={styles.errorCard}>
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </Card>
          )}

          {Platform.OS !== 'ios' && (
            <Card style={styles.warningCard}>
              <Ionicons name="information-circle" size={20} color="#F59E0B" />
              <Text style={styles.warningText}>
                Apple Health is only available on iOS. You can still use GrowthTrack and log data manually.
              </Text>
            </Card>
          )}
        </ScrollView>

        <View style={styles.footer}>
          {isConnecting || isSyncing ? (
            <View style={styles.loadingButton}>
              <ActivityIndicator color="#FFFFFF" />
              <Text style={styles.loadingText}>
                {isSyncing ? 'Syncing health data...' : 'Connecting...'}
              </Text>
            </View>
          ) : (
            <Button
              title={Platform.OS === 'ios' ? 'Connect Apple Health' : 'Continue without Health'}
              onPress={handleConnect}
              testID="button-connect-health"
            />
          )}
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip for now</Text>
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
  },
  healthCard: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 24,
  },
  healthIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#FFE5EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  healthTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  healthDescription: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  benefits: {
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  benefitContent: {
    flex: 1,
  },
  benefitText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  benefitDescription: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  permissionsList: {
    marginBottom: 24,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8F5F0',
  },
  permissionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E8F5F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionInfo: {
    flex: 1,
  },
  permissionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  permissionDescription: {
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
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEE2E2',
    marginTop: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#991B1B',
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FEF3C7',
    marginTop: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  footer: {
    paddingTop: 16,
    gap: 12,
  },
  loadingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
