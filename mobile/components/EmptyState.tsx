import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type EmptyStateType = 'data' | 'search' | 'error' | 'offline';

interface EmptyStateProps {
  type?: EmptyStateType;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

const defaultIcons: Record<EmptyStateType, keyof typeof Ionicons.glyphMap> = {
  data: 'folder-open-outline',
  search: 'search-outline',
  error: 'alert-circle-outline',
  offline: 'cloud-offline-outline',
};

const iconColors: Record<EmptyStateType, string> = {
  data: '#10B981',
  search: '#6366F1',
  error: '#EF4444',
  offline: '#F59E0B',
};

export function EmptyState({ 
  type = 'data', 
  title, 
  message, 
  actionLabel, 
  onAction,
  icon 
}: EmptyStateProps) {
  const iconName = icon || defaultIcons[type];
  const iconColor = iconColors[type];

  return (
    <View style={styles.container} accessibilityLabel={`${title}. ${message}`}>
      <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
        <Ionicons name={iconName} size={48} color={iconColor} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={onAction}
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function NoDataState({ 
  entityName, 
  onAdd 
}: { 
  entityName: string; 
  onAdd?: () => void;
}) {
  return (
    <EmptyState
      type="data"
      title={`No ${entityName} yet`}
      message={`Start tracking your ${entityName.toLowerCase()} to see your progress here.`}
      actionLabel={onAdd ? `Add ${entityName}` : undefined}
      onAction={onAdd}
    />
  );
}

export function ErrorState({ 
  message = 'Something went wrong. Please try again.',
  onRetry,
  onContactSupport 
}: { 
  message?: string; 
  onRetry?: () => void;
  onContactSupport?: () => void;
}) {
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
      </View>
      <Text style={styles.title}>Oops!</Text>
      <Text style={styles.message}>{message}</Text>
      <View style={styles.buttonRow}>
        {onRetry && (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={onRetry}
            accessibilityLabel="Try again"
            accessibilityRole="button"
          >
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
            <Text style={styles.actionText}>Try Again</Text>
          </TouchableOpacity>
        )}
        {onContactSupport && (
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={onContactSupport}
            accessibilityLabel="Contact support"
            accessibilityRole="button"
          >
            <Text style={styles.secondaryText}>Contact Support</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export function OfflineState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      type="offline"
      title="You're offline"
      message="Check your internet connection and try again."
      actionLabel={onRetry ? "Try Again" : undefined}
      onAction={onRetry}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  secondaryText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
});
