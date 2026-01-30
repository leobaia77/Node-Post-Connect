import { View, Text, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useOfflineStatus } from '@/hooks/useOffline';

interface OfflineIndicatorProps {
  style?: object;
}

export function OfflineIndicator({ style }: OfflineIndicatorProps) {
  const { isOnline, pendingSyncCount } = useOfflineStatus();
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOnline ? -50 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOnline]);

  if (isOnline && pendingSyncCount === 0) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container, 
        style,
        { transform: [{ translateY: slideAnim }] }
      ]}
      accessibilityLabel={isOnline ? `Syncing ${pendingSyncCount} items` : 'You are offline'}
      accessibilityRole="alert"
    >
      {!isOnline ? (
        <>
          <Ionicons name="cloud-offline" size={16} color="#FFFFFF" />
          <Text style={styles.text}>You're offline</Text>
          {pendingSyncCount > 0 && (
            <Text style={styles.badge}>{pendingSyncCount} pending</Text>
          )}
        </>
      ) : (
        <>
          <Ionicons name="sync" size={16} color="#FFFFFF" />
          <Text style={styles.text}>Syncing {pendingSyncCount} items...</Text>
        </>
      )}
    </Animated.View>
  );
}

export function OfflineBanner() {
  const { isOnline, pendingSyncCount } = useOfflineStatus();

  if (isOnline && pendingSyncCount === 0) {
    return null;
  }

  return (
    <View 
      style={[styles.banner, !isOnline && styles.bannerOffline]}
      accessibilityLabel={isOnline ? `Syncing ${pendingSyncCount} items` : 'You are offline. Changes will sync when connected.'}
      accessibilityRole="alert"
    >
      <Ionicons 
        name={isOnline ? "sync" : "cloud-offline"} 
        size={18} 
        color={isOnline ? "#10B981" : "#DC2626"} 
      />
      <View style={styles.bannerContent}>
        <Text style={[styles.bannerTitle, !isOnline && styles.bannerTitleOffline]}>
          {isOnline ? 'Syncing...' : 'You\'re offline'}
        </Text>
        <Text style={styles.bannerText}>
          {isOnline 
            ? `${pendingSyncCount} item${pendingSyncCount !== 1 ? 's' : ''} syncing`
            : 'Changes will sync when connected'
          }
        </Text>
      </View>
      {pendingSyncCount > 0 && !isOnline && (
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingText}>{pendingSyncCount}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#374151',
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 1000,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 12,
    color: '#FFFFFF',
    overflow: 'hidden',
  },
  banner: {
    backgroundColor: '#F0FDF9',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  bannerOffline: {
    backgroundColor: '#FEF2F2',
    borderColor: '#DC2626',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#065F46',
  },
  bannerTitleOffline: {
    color: '#991B1B',
  },
  bannerText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  pendingBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
