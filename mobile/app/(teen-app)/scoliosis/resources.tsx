import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui';

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const RESOURCES: ResourceItem[] = [
  {
    id: '1',
    title: 'Understanding Scoliosis',
    description: 'Learn about the different types of scoliosis and how it affects your spine.',
    category: 'Education',
    icon: 'school-outline',
    color: '#3B82F6',
  },
  {
    id: '2',
    title: 'Brace Wear Guide',
    description: 'Tips for wearing your brace comfortably and maximizing treatment effectiveness.',
    category: 'Treatment',
    icon: 'body-outline',
    color: '#10B981',
  },
  {
    id: '3',
    title: 'PT Exercise Library',
    description: 'Video tutorials for all your physical therapy exercises with proper form guidance.',
    category: 'Exercises',
    icon: 'fitness-outline',
    color: '#8B5CF6',
  },
  {
    id: '4',
    title: 'Pain Management Tips',
    description: 'Strategies for managing discomfort and improving your daily comfort.',
    category: 'Wellness',
    icon: 'heart-outline',
    color: '#EC4899',
  },
  {
    id: '5',
    title: 'Sports & Activities',
    description: 'How to stay active safely while managing scoliosis.',
    category: 'Lifestyle',
    icon: 'basketball-outline',
    color: '#F59E0B',
  },
  {
    id: '6',
    title: 'Mental Health Support',
    description: 'Resources for dealing with the emotional aspects of having scoliosis.',
    category: 'Support',
    icon: 'chatbubble-ellipses-outline',
    color: '#6366F1',
  },
];

const FAQ_ITEMS = [
  {
    question: 'How long do I need to wear my brace each day?',
    answer: 'Most prescribed braces are worn 16-23 hours per day. Your doctor will give you specific instructions based on your curve and brace type.',
  },
  {
    question: 'Can I play sports with scoliosis?',
    answer: 'Most teens with scoliosis can participate in sports and physical activities. Swimming, yoga, and core-strengthening exercises are often recommended. Talk to your doctor about any specific restrictions.',
  },
  {
    question: 'Will my curve get worse?',
    answer: 'With proper treatment including brace wear and PT exercises, many curves can be stabilized or improved. Following your treatment plan is key to the best outcomes.',
  },
  {
    question: 'What if my brace is uncomfortable?',
    answer: 'Some discomfort is normal initially, but severe pain or skin issues should be reported to your orthotist or doctor. Wearing a thin cotton shirt underneath can help.',
  },
];

export default function ResourcesScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Resources & Support</Text>
        <Text style={styles.subtitle}>
          Educational materials and helpful information for managing scoliosis
        </Text>

        <Text style={styles.sectionTitle}>Learning Center</Text>
        {RESOURCES.map((resource) => (
          <TouchableOpacity key={resource.id} data-testid={`resource-${resource.id}`}>
            <Card style={styles.resourceCard}>
              <View style={[styles.resourceIcon, { backgroundColor: `${resource.color}15` }]}>
                <Ionicons name={resource.icon} size={24} color={resource.color} />
              </View>
              <View style={styles.resourceContent}>
                <View style={styles.resourceHeader}>
                  <Text style={[styles.resourceCategory, { color: resource.color }]}>
                    {resource.category}
                  </Text>
                </View>
                <Text style={styles.resourceTitle}>{resource.title}</Text>
                <Text style={styles.resourceDescription}>{resource.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </Card>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        {FAQ_ITEMS.map((item, index) => (
          <Card key={index} style={styles.faqCard}>
            <View style={styles.faqHeader}>
              <Ionicons name="help-circle" size={20} color="#8B5CF6" />
              <Text style={styles.faqQuestion}>{item.question}</Text>
            </View>
            <Text style={styles.faqAnswer}>{item.answer}</Text>
          </Card>
        ))}

        <Card style={styles.helpCard}>
          <View style={styles.helpContent}>
            <View style={styles.helpIcon}>
              <Ionicons name="medical" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.helpText}>
              <Text style={styles.helpTitle}>Need Help?</Text>
              <Text style={styles.helpDescription}>
                Contact your healthcare provider if you have concerns about your treatment.
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.helpButton}
            data-testid="button-contact-provider"
          >
            <Text style={styles.helpButtonText}>Contact Provider</Text>
          </TouchableOpacity>
        </Card>

        <Card style={styles.emergencyCard}>
          <View style={styles.emergencyHeader}>
            <Ionicons name="warning" size={20} color="#DC2626" />
            <Text style={styles.emergencyTitle}>When to Seek Immediate Care</Text>
          </View>
          <View style={styles.emergencyList}>
            <Text style={styles.emergencyItem}>Sudden severe back pain</Text>
            <Text style={styles.emergencyItem}>Numbness or weakness in legs</Text>
            <Text style={styles.emergencyItem}>Loss of bladder or bowel control</Text>
            <Text style={styles.emergencyItem}>Difficulty breathing</Text>
          </View>
          <Text style={styles.emergencyNote}>
            If experiencing any of these symptoms, seek medical attention immediately.
          </Text>
        </Card>

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
  scrollView: {
    flex: 1,
    padding: 24,
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  resourceContent: {
    flex: 1,
  },
  resourceHeader: {
    marginBottom: 4,
  },
  resourceCategory: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  faqCard: {
    padding: 20,
    marginBottom: 12,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 22,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 22,
    paddingLeft: 32,
  },
  helpCard: {
    padding: 20,
    marginTop: 12,
    marginBottom: 24,
    backgroundColor: '#8B5CF6',
  },
  helpContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  helpIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  helpText: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  helpDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  helpButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  helpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  emergencyCard: {
    padding: 20,
    marginBottom: 24,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991B1B',
  },
  emergencyList: {
    marginBottom: 12,
  },
  emergencyItem: {
    fontSize: 14,
    color: '#7F1D1D',
    lineHeight: 28,
    paddingLeft: 16,
  },
  emergencyNote: {
    fontSize: 13,
    color: '#B91C1C',
    fontStyle: 'italic',
  },
  footer: {
    height: 24,
  },
});
