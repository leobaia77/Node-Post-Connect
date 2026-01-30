import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const LAST_UPDATED = 'January 30, 2026';
const CONTACT_EMAIL = 'privacy@growthtrack.app';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  const handleContact = () => {
    Linking.openURL(`mailto:${CONTACT_EMAIL}`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Privacy Policy</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last Updated: {LAST_UPDATED}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Introduction</Text>
          <Text style={styles.paragraph}>
            GrowthTrack ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your personal information when you use our mobile application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Information We Collect</Text>
          <Text style={styles.paragraph}>
            We collect the following types of information:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Account information (name, email, age range)</Text>
            <Text style={styles.bulletItem}>• Health and fitness data you log (sleep, workouts, nutrition, daily check-ins)</Text>
            <Text style={styles.bulletItem}>• Health data synced from Apple HealthKit (with your permission)</Text>
            <Text style={styles.bulletItem}>• Goals and preferences you set</Text>
            <Text style={styles.bulletItem}>• Parent-teen relationship data (if applicable)</Text>
            <Text style={styles.bulletItem}>• Scoliosis care data (PT exercises, brace wear time, symptoms)</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How We Use Your Data</Text>
          <Text style={styles.paragraph}>
            Your data is used exclusively for:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Providing personalized health insights and recommendations</Text>
            <Text style={styles.bulletItem}>• Tracking your progress toward your health goals</Text>
            <Text style={styles.bulletItem}>• Enabling parent oversight features (with your consent)</Text>
            <Text style={styles.bulletItem}>• Generating safety alerts for concerning health patterns</Text>
            <Text style={styles.bulletItem}>• Improving the app experience based on usage patterns</Text>
          </View>
        </View>

        <View style={styles.highlightBox}>
          <Ionicons name="shield-checkmark" size={24} color="#10B981" />
          <Text style={styles.highlightText}>
            We NEVER use your health data for advertising purposes. Your health information is never sold to third parties or used to target ads.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Storage & Security</Text>
          <Text style={styles.paragraph}>
            Your data is stored securely on encrypted servers. We use industry-standard security measures including:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• End-to-end encryption for sensitive health data</Text>
            <Text style={styles.bulletItem}>• Secure authentication with encrypted passwords</Text>
            <Text style={styles.bulletItem}>• Regular security audits and updates</Text>
            <Text style={styles.bulletItem}>• Limited employee access to personal data</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apple HealthKit Data</Text>
          <Text style={styles.paragraph}>
            If you choose to connect Apple HealthKit, we access your health data in read-only mode. This data is:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Used only within the GrowthTrack app</Text>
            <Text style={styles.bulletItem}>• Never shared with third parties</Text>
            <Text style={styles.bulletItem}>• Never used for advertising or marketing</Text>
            <Text style={styles.bulletItem}>• Stored in compliance with Apple's HealthKit guidelines</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Sharing</Text>
          <Text style={styles.paragraph}>
            We only share your data in these limited circumstances:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• With your linked parent/guardian (based on your sharing preferences)</Text>
            <Text style={styles.bulletItem}>• When required by law or legal process</Text>
            <Text style={styles.bulletItem}>• To protect the safety of users or the public</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Access all your personal data</Text>
            <Text style={styles.bulletItem}>• Export your data in a portable format</Text>
            <Text style={styles.bulletItem}>• Delete your account and all associated data</Text>
            <Text style={styles.bulletItem}>• Control what data is shared with parents/guardians</Text>
            <Text style={styles.bulletItem}>• Disconnect HealthKit at any time</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Delete Your Data</Text>
          <Text style={styles.paragraph}>
            You can delete your account and all associated data at any time by going to Settings → Account → Delete Account. Your data will be immediately removed from our active systems, with backups being purged within 30 days.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Children's Privacy</Text>
          <Text style={styles.paragraph}>
            GrowthTrack is designed for teens aged 13 and older. We do not knowingly collect information from children under 13. If you believe a child under 13 has provided us with personal information, please contact us immediately.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have questions about this Privacy Policy or your data, please contact us at:
          </Text>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={handleContact}
            accessibilityLabel="Email privacy support"
            accessibilityRole="button"
          >
            <Ionicons name="mail" size={20} color="#FFFFFF" />
            <Text style={styles.contactButtonText}>{CONTACT_EMAIL}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer} />
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
    paddingTop: 8,
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
    paddingTop: 0,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4B5563',
  },
  bulletList: {
    marginTop: 8,
    paddingLeft: 8,
  },
  bulletItem: {
    fontSize: 15,
    lineHeight: 26,
    color: '#4B5563',
  },
  highlightBox: {
    backgroundColor: '#E8F5F0',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  highlightText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    color: '#065F46',
    fontWeight: '600',
  },
  contactButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 12,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    height: 40,
  },
});
