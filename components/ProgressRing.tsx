import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../theme/tokens';

export interface ProgressRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  accessibilityLabel: string;
}

const MIN_STROKE_WIDTH = 8;

export function ProgressRing({
  percent,
  size = 96,
  strokeWidth = 10,
  label,
  accessibilityLabel,
}: ProgressRingProps) {
  const normalizedPercent = Math.min(100, Math.max(0, percent));
  const resolvedStrokeWidth = Math.max(MIN_STROKE_WIDTH, strokeWidth);
  const radius = (size - resolvedStrokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * normalizedPercent) / 100;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: normalizedPercent }}
      className="items-center"
    >
      <Svg width={size} height={size} accessibilityElementsHidden>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors['border-warm']}
          strokeWidth={resolvedStrokeWidth}
          fill="none"
        />
        <Circle
          testID="progress-ring-arc"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors['primary-container']}
          strokeWidth={resolvedStrokeWidth}
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
