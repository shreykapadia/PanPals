import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, StyleProp, ViewStyle } from 'react-native';
import { useReducedMotion } from '../../lib/useReducedMotion';

interface RevealProps {
  /** Milliseconds to wait before starting — used to stagger a group. */
  delay?: number;
  duration?: number;
  /** How far the content rises into place, in px. */
  distance?: number;
  /** Applied to an inner plain View so NativeWind resolves it normally. */
  className?: string;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

const DEFAULT_DURATION = 240;

/**
 * Fade-and-rise entrance for the onboarding surfaces. With Reduce Motion on
 * it renders the final state on the first frame — no animation runs at all.
 */
export const Reveal: React.FC<RevealProps> = ({
  delay = 0,
  duration = DEFAULT_DURATION,
  distance = 12,
  className = '',
  style,
  children,
}) => {
  const reducedMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reducedMotion) {
      progress.setValue(1);
      return;
    }

    const animation = Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();

    return () => animation.stop();
  }, [progress, delay, duration, reducedMotion]);

  return (
    <Animated.View
      style={[
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [distance, 0],
              }),
            },
          ],
        },
        style,
      ]}
    >
      <View className={className}>{children}</View>
    </Animated.View>
  );
};
