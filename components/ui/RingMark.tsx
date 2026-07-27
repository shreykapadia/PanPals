import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../../theme/tokens';
import { useReducedMotion } from '../../lib/useReducedMotion';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface RingMarkProps {
  /** 0–100. Values outside the range are clamped. */
  percent: number;
  size?: number;
  strokeWidth?: number;
  /** Milliseconds before the fill starts — used to stagger a group of rings. */
  delay?: number;
  duration?: number;
  children?: React.ReactNode;
}

const DEFAULT_DURATION = 900;

/**
 * Decorative progress ring for the onboarding surfaces: rose fill on a
 * warm-grey track with rounded caps (DESIGN-TOKENS §4).
 *
 * The arc is driven straight through an Animated value onto the circle's
 * `strokeDashoffset`, so filling it costs no React re-renders.
 *
 * Deliberately NOT the dashboard ring. `components/ProgressRing.tsx` (Aaron's
 * lane) is the data-bearing one with its own accessibility contract; this is a
 * brand mark, so it carries no `progressbar` role and expects the caller to
 * label — or hide — the surrounding region.
 */
export const RingMark: React.FC<RingMarkProps> = ({
  percent,
  size = 64,
  strokeWidth = 10,
  delay = 0,
  duration = DEFAULT_DURATION,
  children,
}) => {
  const target = Math.min(100, Math.max(0, percent));
  const reducedMotion = useReducedMotion();
  const progress = useRef(new Animated.Value(0)).current;

  const { radius, circumference } = useMemo(() => {
    const r = (size - strokeWidth) / 2;
    return { radius: r, circumference: 2 * Math.PI * r };
  }, [size, strokeWidth]);

  useEffect(() => {
    if (reducedMotion) {
      progress.setValue(1);
      return;
    }

    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      easing: Easing.out(Easing.cubic),
      // strokeDashoffset is an SVG prop, so it can't run on the native driver.
      useNativeDriver: false,
    });
    animation.start();

    return () => animation.stop();
  }, [progress, target, delay, duration, reducedMotion]);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, circumference - (circumference * target) / 100],
  });

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors['border-warm']}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors['primary-container']}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {children}
    </View>
  );
};
