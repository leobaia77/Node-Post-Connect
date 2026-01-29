import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
  style?: ViewStyle;
}

export function ProgressBar({ current, total, showLabel = true, style }: ProgressBarProps) {
  const percentage = Math.round((current / total) * 100);

  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <Text style={styles.label}>Step {current} of {total}</Text>
      )}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    textAlign: 'center',
  },
  track: {
    height: 6,
    backgroundColor: '#E8F5F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
});
