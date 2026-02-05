import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Card, Select } from '@/components/ui';

const GOAL_FILTERS = [
  { label: 'All Goals', value: 'all' },
  { label: 'Athletic Performance', value: 'athletic' },
  { label: 'Muscle Growth', value: 'muscle' },
  { label: 'Bone Health', value: 'bone' },
  { label: 'General Growth', value: 'growth' },
];

const screenWidth = Dimensions.get('window').width;

export default function InsightsScreen() {
  const [filter, setFilter] = useState<string | null>('all');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
        <Text style={styles.subtitle}>Your health trends at a glance</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Select
          label="Filter by Goal"
          options={GOAL_FILTERS}
          value={filter}
          onValueChange={setFilter}
          testID="select-goal-filter"
        />

        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Sleep vs Training Load</Text>
            <Text style={styles.chartSubtitle}>Last 14 days</Text>
          </View>
          
          <View style={styles.chartPlaceholder}>
            <View style={styles.chartBars}>
              {[7, 6.5, 8, 7.5, 6, 8.5, 7, 7.5, 6.5, 8, 7, 8.5, 7, 7.5].map((value, index) => (
                <View key={index} style={styles.barContainer}>
                  <View 
                    style={[
                      styles.bar, 
                      { height: (value / 10) * 80 },
                      value >= 7.5 ? styles.barGood : value >= 6.5 ? styles.barOk : styles.barLow,
                    ]} 
                  />
                </View>
              ))}
            </View>
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.legendText}>Sleep (hrs)</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                <Text style={styles.legendText}>Training (hrs)</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.viewDetails}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color="#10B981" />
          </TouchableOpacity>
        </Card>

        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Macro Adherence</Text>
            <Text style={styles.chartSubtitle}>Today</Text>
          </View>
          
          <View style={styles.macroRow}>
            <View style={styles.macroItem}>
              <View style={styles.macroCircle}>
                <Text style={styles.macroPercent}>75%</Text>
              </View>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroItem}>
              <View style={styles.macroCircle}>
                <Text style={styles.macroPercent}>60%</Text>
              </View>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroItem}>
              <View style={styles.macroCircle}>
                <Text style={styles.macroPercent}>85%</Text>
              </View>
              <Text style={styles.macroLabel}>Fats</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.viewDetails}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color="#10B981" />
          </TouchableOpacity>
        </Card>

        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Consistency Score</Text>
            <Text style={styles.chartSubtitle}>This week</Text>
          </View>
          
          <View style={styles.consistencyContainer}>
            <View style={styles.consistencyRing}>
              <Text style={styles.consistencyScore}>82</Text>
              <Text style={styles.consistencyLabel}>/ 100</Text>
            </View>
            <View style={styles.consistencyMetrics}>
              <View style={styles.metricItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.metricText}>5/7 check-ins</Text>
              </View>
              <View style={styles.metricItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.metricText}>4/5 workouts logged</Text>
              </View>
              <View style={styles.metricItem}>
                <Ionicons name="alert-circle" size={20} color="#F59E0B" />
                <Text style={styles.metricText}>3/7 meals logged</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.viewDetails}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Ionicons name="chevron-forward" size={16} color="#10B981" />
          </TouchableOpacity>
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
  header: {
    padding: 24,
    paddingBottom: 8,
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
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 8,
  },
  chartCard: {
    marginBottom: 16,
  },
  chartHeader: {
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
    marginBottom: 12,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  bar: {
    width: 12,
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
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#64748B',
  },
  viewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 6,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroPercent: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  macroLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  consistencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  consistencyRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 8,
    borderColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 24,
  },
  consistencyScore: {
    fontSize: 32,
    fontWeight: '700',
    color: '#10B981',
  },
  consistencyLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  consistencyMetrics: {
    flex: 1,
    gap: 8,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricText: {
    fontSize: 14,
    color: '#374151',
  },
  footer: {
    height: 24,
  },
});
