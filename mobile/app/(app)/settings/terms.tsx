import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const LAST_UPDATED = 'January 30, 2026';

export default function TermsOfServiceScreen() {
  const router = useRouter();

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
        <Text style={styles.title}>Terms of Service</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last Updated: {LAST_UPDATED}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agreement to Terms</Text>
          <Text style={styles.paragraph}>
            By accessing or using GrowthTrack, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the app.
          </Text>
        </View>

        <View style={styles.highlightBox}>
          <Ionicons name="information-circle" size={24} color="#3B82F6" />
          <Text style={styles.highlightText}>
            You must be at least 13 years old to use GrowthTrack. If you are under 18, you should review these terms with a parent or guardian.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Age Requirements</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• You must be at least 13 years of age to create an account</Text>
            <Text style={styles.bulletItem}>• Users under 18 may require parent/guardian consent in some jurisdictions</Text>
            <Text style={styles.bulletItem}>• Parents/guardians can link their account to monitor their teen's health data</Text>
            <Text style={styles.bulletItem}>• We reserve the right to terminate accounts that violate age requirements</Text>
          </View>
        </View>

        <View style={styles.warningBox}>
          <Ionicons name="medical" size={24} color="#DC2626" />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>NOT MEDICAL ADVICE</Text>
            <Text style={styles.warningText}>
              GrowthTrack provides educational health guidance only. The app does NOT provide medical diagnosis, treatment, or advice. Always consult with qualified healthcare providers for medical concerns.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Educational Purpose</Text>
          <Text style={styles.paragraph}>
            GrowthTrack is designed to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Provide evidence-based health education for teens</Text>
            <Text style={styles.bulletItem}>• Help track sleep, nutrition, workouts, and wellness</Text>
            <Text style={styles.bulletItem}>• Offer personalized guidance based on your goals</Text>
            <Text style={styles.bulletItem}>• Support healthy habits and athletic performance</Text>
          </View>
          <Text style={[styles.paragraph, { marginTop: 12 }]}>
            GrowthTrack is NOT a substitute for professional medical care, physical therapy, or mental health services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parent/Guardian Responsibility</Text>
          <Text style={styles.paragraph}>
            If you are a parent or guardian using GrowthTrack to monitor a teen:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• You are responsible for ensuring appropriate use of the app</Text>
            <Text style={styles.bulletItem}>• You must respect the privacy settings your teen has configured</Text>
            <Text style={styles.bulletItem}>• Alerts and recommendations are for informational purposes only</Text>
            <Text style={styles.bulletItem}>• You should discuss health concerns with appropriate professionals</Text>
            <Text style={styles.bulletItem}>• The app does not replace parental judgment or professional guidance</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acceptable Use</Text>
          <Text style={styles.paragraph}>
            You agree NOT to:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Provide false or misleading information in your account</Text>
            <Text style={styles.bulletItem}>• Use the app in ways that could harm yourself or others</Text>
            <Text style={styles.bulletItem}>• Attempt to access other users' accounts or data</Text>
            <Text style={styles.bulletItem}>• Use automated systems to access the app</Text>
            <Text style={styles.bulletItem}>• Share your account credentials with others</Text>
            <Text style={styles.bulletItem}>• Violate any applicable laws or regulations</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User-Generated Content</Text>
          <Text style={styles.paragraph}>
            Any data you enter into GrowthTrack (health logs, goals, notes) remains your property. However, by using the app, you grant us a license to store and process this data to provide our services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            GrowthTrack and its creators are not liable for any damages arising from:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Decisions made based on app recommendations</Text>
            <Text style={styles.bulletItem}>• Health outcomes related to app usage</Text>
            <Text style={styles.bulletItem}>• Service interruptions or data loss</Text>
            <Text style={styles.bulletItem}>• Unauthorized access to your account</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Termination</Text>
          <Text style={styles.paragraph}>
            You may delete your account at any time through Settings. We reserve the right to suspend or terminate accounts that violate these terms or engage in harmful behavior.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We may update these Terms of Service from time to time. Continued use of the app after changes constitutes acceptance of the new terms. We will notify you of significant changes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <Text style={styles.paragraph}>
            For questions about these terms, please contact us at legal@growthtrack.app
          </Text>
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
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  highlightText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    color: '#1E40AF',
    fontWeight: '500',
  },
  warningBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#DC2626',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#991B1B',
  },
  footer: {
    height: 40,
  },
});
