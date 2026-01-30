import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useEffect, useRef } from 'react';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  return (
    <View 
      style={[
        styles.skeleton, 
        { width, height, borderRadius }, 
        style
      ]}
      accessibilityLabel="Loading"
    >
      <Animated.View
        style={[
          styles.shimmer,
          { transform: [{ translateX }] },
        ]}
      />
    </View>
  );
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <Skeleton height={16} width="40%" style={styles.mb8} />
      <Skeleton height={24} width="80%" style={styles.mb12} />
      <Skeleton height={14} width="60%" />
    </View>
  );
}

export function SkeletonListItem() {
  return (
    <View style={styles.listItem}>
      <Skeleton width={48} height={48} borderRadius={24} />
      <View style={styles.listContent}>
        <Skeleton height={16} width="60%" style={styles.mb6} />
        <Skeleton height={14} width="40%" />
      </View>
    </View>
  );
}

export function SkeletonStats() {
  return (
    <View style={styles.statsContainer}>
      <View style={styles.statBox}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <Skeleton height={20} width={60} style={styles.mt8} />
        <Skeleton height={14} width={50} style={styles.mt4} />
      </View>
      <View style={styles.statBox}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <Skeleton height={20} width={60} style={styles.mt8} />
        <Skeleton height={14} width={50} style={styles.mt4} />
      </View>
      <View style={styles.statBox}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <Skeleton height={20} width={60} style={styles.mt8} />
        <Skeleton height={14} width={50} style={styles.mt4} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
  },
  listContent: {
    flex: 1,
    marginLeft: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  statBox: {
    alignItems: 'center',
  },
  mb6: { marginBottom: 6 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
  mt4: { marginTop: 4 },
  mt8: { marginTop: 8 },
});
