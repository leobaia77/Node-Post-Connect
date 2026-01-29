import { View, Text, StyleSheet, PanResponder, Animated, ViewStyle } from 'react-native';
import { useState, useRef, useEffect } from 'react';

interface SliderProps {
  label?: string;
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  leftLabel?: string;
  rightLabel?: string;
  showValue?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export function Slider({
  label,
  value,
  onValueChange,
  min = 0,
  max = 10,
  step = 1,
  leftLabel,
  rightLabel,
  showValue = true,
  style,
  testID,
}: SliderProps) {
  const [sliderWidth, setSliderWidth] = useState(0);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const percentage = ((value - min) / (max - min)) * 100;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: percentage,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [percentage, animatedValue]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      updateValue(evt.nativeEvent.locationX);
    },
    onPanResponderMove: (evt) => {
      updateValue(evt.nativeEvent.locationX);
    },
  });

  const updateValue = (locationX: number) => {
    if (sliderWidth === 0) return;
    
    const newPercentage = Math.max(0, Math.min(100, (locationX / sliderWidth) * 100));
    const rawValue = min + (newPercentage / 100) * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, steppedValue));
    
    onValueChange(clampedValue);
  };

  return (
    <View style={[styles.container, style]} testID={testID}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {showValue && <Text style={styles.value}>{value}</Text>}
        </View>
      )}
      
      <View
        style={styles.sliderTrack}
        onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
        {...panResponder.panHandlers}
      >
        <Animated.View
          style={[
            styles.sliderFill,
            {
              width: animatedValue.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
        <Animated.View
          style={[
            styles.sliderThumb,
            {
              left: animatedValue.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>

      {(leftLabel || rightLabel) && (
        <View style={styles.endLabels}>
          <Text style={styles.endLabel}>{leftLabel}</Text>
          <Text style={styles.endLabel}>{rightLabel}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10B981',
  },
  sliderTrack: {
    height: 8,
    backgroundColor: '#E8F5F0',
    borderRadius: 4,
    position: 'relative',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#10B981',
    borderRadius: 4,
  },
  sliderThumb: {
    position: 'absolute',
    top: -8,
    marginLeft: -12,
    width: 24,
    height: 24,
    backgroundColor: '#10B981',
    borderRadius: 12,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  endLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  endLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
});
