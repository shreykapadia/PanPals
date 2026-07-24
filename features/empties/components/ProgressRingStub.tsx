import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../../../theme/tokens';
import { emptiesStrings } from '../strings';
import { useReducedMotion } from '../useReducedMotion';

export interface ProgressRingProps {
  percent: number;
  size?: number;
  label?: string;
}

const RING_LOAD_DURATION = 360;

export function ProgressRingStub({ percent, size = 112, label }: ProgressRingProps) {
  const normalizedPercent = Math.min(100, Math.max(0, percent));
  const reducedMotion = useReducedMotion();
  const [displayPercent, setDisplayPercent] = useState(reducedMotion ? normalizedPercent : 0);
  const animationFrame = useRef<number | null>(null);
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * displayPercent) / 100;

  useEffect(() => {
    if (reducedMotion) {
      setDisplayPercent(normalizedPercent);
      return;
    }

    setDisplayPercent(0);
    let startTime: number | null = null;
    const fillRing = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / RING_LOAD_DURATION, 1);
      setDisplayPercent(normalizedPercent * progress);

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(fillRing);
      }
    };
    animationFrame.current = requestAnimationFrame(fillRing);

    return () => {
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [normalizedPercent, reducedMotion]);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={emptiesStrings.progressRingAccessibility(normalizedPercent)}
      accessibilityValue={{ min: 0, max: 100, now: normalizedPercent }}
      className="items-center"
    >
      <Svg width={size} height={size} accessibilityElementsHidden>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors['border-warm']}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
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
      {label ? <Text className="mt-2 text-xs font-satoshi text-muted-text">{label}</Text> : null}
    </View>
  );
}
