import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button, Card, ProgressBar } from '@/components/ui';

export default function ConnectHealthScreen() {
  const router = useRouter();

  const handleConnect = () => {
    router.push('/(teen-onboarding)/link-parent');
  };

  const handleSkip = () => {
    router.push('/(teen-onboarding)/link-parent');
  };

  const handleBack = () => {
    router.back();
  };

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
            Automatically sync your health data for better insights
          </Text>
        </View>

        <View style={styles.content}>
          <Card style={styles.healthCard} variant="elevated">
            <View style={styles.healthIcon}>
              <Ionicons name="heart" size={48} color="#FF2D55" />
            </View>
            <Text style={styles.healthTitle}>Apple Health</Text>
            <Text style={styles.healthDescription}>
              We can automatically import your sleep, activity, and workout data
            </Text>
          </Card>

          <View style={styles.benefits}>
            <Text style={styles.benefitsTitle}>Benefits:</Text>
            
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.benefitText}>Automatic sleep tracking</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.benefitText}>Workout detection</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <Text style={styles.benefitText}>More accurate recommendations</Text>
            </View>
          </View>

          <Card style={styles.privacyCard}>
            <Ionicons name="shield-checkmark" size={24} color="#10B981" />
            <View style={styles.privacyText}>
              <Text style={styles.privacyTitle}>Your data is safe</Text>
              <Text style={styles.privacyDescription}>
                Health data is never used for advertising and only shared according to your preferences.
              </Text>
            </View>
          </Card>
        </View>

        <View style={styles.footer}>
          <Button
            title="Connect Apple Health"
            onPress={handleConnect}
            testID="button-connect-health"
          />
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
  },
  benefits: {
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 16,
    color: '#374151',
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
