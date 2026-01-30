import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui';

const DATE_RANGES = [
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
];

const screenWidth = Dimensions.get('window').width;

export default function TrendsScreen() {
  const [dateRange, setDateRange] = useState(7);
  const [detailedView, setDetailedView] = useState(true);
  const [teenAllowsDetailedSharing, setTeenAllowsDetailedSharing] = useState(true);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Trends</Text>
        <Text style={styles.subtitle}>Track progress over time</Text>
      </View>

      <View style={styles.dateRangePicker}>
        {DATE_RANGES.map((range) => (
          <TouchableOpacity
            key={range.value}
            style={[
              styles.dateRangeOption,
              dateRange === range.value && styles.dateRangeOptionSelected,
            ]}
            onPress={() => setDateRange(range.value)}
            testID={`button-range-${range.value}`}
          >
            <Text style={[
              styles.dateRangeText,
              dateRange === range.value && styles.dateRangeTextSelected,
            ]}>
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.privacyBanner}>
          <Ionicons name="shield-checkmark" size={16} color="#10B981" />
          <Text style={styles.privacyBannerText}>
            Showing data your teen has chosen to share with you
          </Text>
        </View>

        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Sleep Trend</Text>
              <Text style={styles.chartSubtitle}>{teenAllowsDetailedSharing ? 'Hours per night' : 'Summary view'}</Text>
            </View>
            <TouchableOpacity style={styles.infoButton} testID="button-sleep-info">
              <Ionicons name="information-circle-outline" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {teenAllowsDetailedSharing ? (
            <View style={styles.chartPlaceholder}>
              <View style={styles.chartBars}>
                {[7.5, 6.5, 8, 7, 6, 8.5, 7.5].map((value, index) => (
                  <View key={index} style={styles.barContainer}>
                    <View 
                      style={[
                        styles.bar, 
                        { height: (value / 10) * 80 },
                        value >= 8 ? styles.barGood : value >= 7 ? styles.barOk : styles.barLow,
                      ]} 
                    />
                    <Text style={styles.barLabel}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.targetLine}>
                <View style={styles.targetLineDash} />
                <Text style={styles.targetLineText}>8h target</Text>
              </View>
            </View>
          ) : (
            <View style={styles.limitedSummary}>
              <Ionicons name="moon" size={32} color="#8B5CF6" />
              <Text style={styles.limitedValue}>7.3h avg</Text>
              <Text style={styles.limitedLabel}>Weekly average (limited view)</Text>
            </View>
          )}

          <View style={styles.chartSummary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>7.3h</Text>
              <Text style={styles.summaryLabel}>Average</Text>
            </View>
            {teenAllowsDetailedSharing && (
              <>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>6h</Text>
                  <Text style={styles.summaryLabel}>Lowest</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>8.5h</Text>
                  <Text style={styles.summaryLabel}>Highest</Text>
                </View>
              </>
            )}
          </View>
        </Card>

        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Training Load</Text>
              <Text style={styles.chartSubtitle}>{teenAllowsDetailedSharing ? 'Weekly minutes' : 'Summary view'}</Text>
            </View>
            <TouchableOpacity style={styles.infoButton} testID="button-training-info">
              <Ionicons name="information-circle-outline" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {teenAllowsDetailedSharing ? (
            <View style={styles.trainingChart}>
              <View style={styles.trainingBar}>
                <View style={[styles.trainingFill, { width: '75%' }]} />
              </View>
              <Text style={styles.trainingValue}>7.5 hours this week</Text>
            </View>
          ) : (
            <View style={styles.limitedSummary}>
              <Ionicons name="barbell" size={32} color="#F59E0B" />
              <Text style={styles.limitedValue}>7.5h</Text>
              <Text style={styles.limitedLabel}>Total this week (limited view)</Text>
            </View>
          )}

          <View style={styles.chartSummary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>6</Text>
              <Text style={styles.summaryLabel}>Sessions</Text>
            </View>
            {teenAllowsDetailedSharing && (
              <>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>75min</Text>
                  <Text style={styles.summaryLabel}>Avg/Session</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, styles.summaryGood]}>On Track</Text>
                  <Text style={styles.summaryLabel}>Status</Text>
                </View>
              </>
            )}
          </View>
        </Card>

        {detailedView && teenAllowsDetailedSharing && (
          <Card style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View>
                <Text style={styles.chartTitle}>Check-in Trends</Text>
                <Text style={styles.chartSubtitle}>Mood, energy, stress</Text>
              </View>
            </View>

            <View style={styles.trendRow}>
              <View style={styles.trendItem}>
                <Ionicons name="happy" size={24} color="#10B981" />
                <View style={styles.trendInfo}>
                  <Text style={styles.trendLabel}>Mood</Text>
                  <View style={styles.trendIndicator}>
                    <Ionicons name="trending-up" size={16} color="#10B981" />
                    <Text style={styles.trendUp}>Improving</Text>
                  </View>
                </View>
              </View>
              <View style={styles.trendItem}>
                <Ionicons name="flash" size={24} color="#F59E0B" />
                <View style={styles.trendInfo}>
                  <Text style={styles.trendLabel}>Energy</Text>
                  <View style={styles.trendIndicator}>
                    <Ionicons name="remove" size={16} color="#64748B" />
                    <Text style={styles.trendStable}>Stable</Text>
                  </View>
                </View>
              </View>
              <View style={styles.trendItem}>
                <Ionicons name="pulse" size={24} color="#3B82F6" />
                <View style={styles.trendInfo}>
                  <Text style={styles.trendLabel}>Stress</Text>
                  <View style={styles.trendIndicator}>
                    <Ionicons name="trending-down" size={16} color="#10B981" />
                    <Text style={styles.trendDown}>Decreasing</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.privacyNote}>
              <Ionicons name="shield-checkmark" size={16} color="#10B981" />
              <Text style={styles.privacyText}>
                Detailed check-in data shared with your teen's consent
              </Text>
            </View>
          </Card>
        )}

        {!teenAllowsDetailedSharing && (
          <Card style={styles.privacyCard}>
            <Ionicons name="lock-closed" size={24} color="#64748B" />
            <View style={styles.privacyCardContent}>
              <Text style={styles.privacyCardTitle}>Detailed View Restricted</Text>
              <Text style={styles.privacyCardText}>
                Your teen has chosen not to share detailed check-in data. 
                This is part of building healthy boundaries and trust.
              </Text>
            </View>
          </Card>
        )}

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
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
  },
  dateRangePicker: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 8,
  },
  dateRangeOption: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateRangeOptionSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  dateRangeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748B',
  },
  dateRangeTextSelected: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 0,
  },
  chartCard: {
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  infoButton: {
    padding: 4,
  },
  chartPlaceholder: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
    marginBottom: 8,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  bar: {
    width: 24,
    borderRadius: 6,
  },
  barGood: {
    backgroundColor: '#10B981',
  },
  barOk: {
    backgroundColor: '#F59E0B',
  },
  barLow: {
    backgroundColor: '#EF4444',
  },
  barLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
  },
  targetLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  targetLineDash: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#94A3B8',
  },
  targetLineText: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 8,
  },
  chartSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  summaryGood: {
    color: '#10B981',
  },
  trainingChart: {
    marginBottom: 16,
  },
  trainingBar: {
    height: 24,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  trainingFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 12,
  },
  trainingValue: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  trendItem: {
    flex: 1,
    alignItems: 'center',
  },
  trendInfo: {
    alignItems: 'center',
    marginTop: 8,
  },
  trendLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  trendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  trendUp: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  trendStable: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  trendDown: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F5F0',
    borderRadius: 8,
    padding: 12,
  },
  privacyText: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
  },
  footer: {
    height: 24,
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F5F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  privacyBannerText: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 16,
  },
  privacyCardContent: {
    flex: 1,
  },
  privacyCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  privacyCardText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  limitedSummary: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginBottom: 16,
  },
  limitedValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 8,
  },
  limitedLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
});
