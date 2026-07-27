import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { colors } from '../../theme/tokens';
import { useReducedMotion } from '../../lib/useReducedMotion';

interface StepRailProps {
  /** 1-based index of the step currently in progress. */
  current: number;
  total: number;
  /** Announced to assistive tech, e.g. "Step 2 of 3". */
  accessibilityLabel: string;
}

const FILL_DURATION = 320;

const Segment: React.FC<{ filled: boolean; reducedMotion: boolean }> = ({
  filled,
  reducedMotion,
}) => {
  const progress = useRef(new Animated.Value(filled ? 1 : 0)).current;

  useEffect(() => {
    if (reducedMotion) {
      progress.setValue(filled ? 1 : 0);
      return;
    }

    const animation = Animated.timing(progress, {
      toValue: filled ? 1 : 0,
      duration: FILL_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
    animation.start();

    return () => animation.stop();
  }, [progress, filled, reducedMotion]);

  return (
    <View className="flex-1 h-1 rounded-full bg-border-warm overflow-hidden">
      <Animated.View
        style={{
          height: '100%',
          backgroundColor: colors['primary-container'],
          width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }}
      />
    </View>
  );
};

/**
 * Segmented progress rail across the onboarding steps. Progress is conveyed by
 * segment fill *and* by the accessibility label, never by color alone
 * (AI-CONTEXT §5).
 */
export const StepRail: React.FC<StepRailProps> = ({ current, total, accessibilityLabel }) => {
  const reducedMotion = useReducedMotion();

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: total, now: current }}
      className="flex-row gap-2"
    >
      {Array.from({ length: total }, (_, index) => (
        <Segment key={index} filled={index < current} reducedMotion={reducedMotion} />
      ))}
    </View>
  );
};
