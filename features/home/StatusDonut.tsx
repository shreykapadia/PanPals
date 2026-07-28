import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Badge } from '../../components/ui/Badge';
import { colors } from '../../theme/tokens';
import { ProductStatus } from '../../mocks/types';
import { homeStrings } from './strings';

interface StatusDonutProps {
  statusCounts: Record<ProductStatus, number>;
}

const SIZE = 88;
const STROKE_WIDTH = 12;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function StatusDonut({ statusCounts }: StatusDonutProps) {
  const inRotation = statusCounts.in_rotation ?? 0;
  const unopened = statusCounts.unopened ?? 0;
  const finished = statusCounts.finished ?? 0;
  const total = inRotation + unopened + finished;

  const inRotationFraction = total === 0 ? 0 : inRotation / total;
  const finishedFraction = total === 0 ? 0 : finished / total;

  return (
    <View className="mb-8 flex-row items-center rounded-3xl border border-border-warm bg-card-surface p-4">
      <View
        accessibilityLabel={homeStrings.statusDonutAccessibilityLabel(
          inRotation,
          unopened,
          finished,
        )}
      >
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={colors['border-warm']}
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={colors['primary-container']}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${inRotationFraction * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={0}
            rotation="-90"
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={colors['eco-sage']}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${finishedFraction * CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={-inRotationFraction * CIRCUMFERENCE}
            rotation="-90"
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
        </Svg>
        <View className="absolute inset-0 items-center justify-center">
          <Text className="text-sm font-satoshi-bold text-dark-neutral">
            {homeStrings.statusDonutTotalLabel(total)}
          </Text>
        </View>
      </View>
      <View className="ml-4 flex-1">
        <Text className="mb-2 text-base font-satoshi-bold text-dark-neutral">
          {homeStrings.statusDonutTitle}
        </Text>
        <View className="flex-row flex-wrap gap-2">
          <Badge label={homeStrings.statusInRotationCount(inRotation)} variant="success" />
          <Badge label={homeStrings.statusUnopenedCount(unopened)} />
          <Badge label={homeStrings.statusFinishedCount(finished)} />
        </View>
      </View>
    </View>
  );
}
