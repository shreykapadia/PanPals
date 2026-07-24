import React from 'react';
import { Text, View } from 'react-native';
import { DashboardData } from '../../mocks/types';
import { ProgressRing } from './components/ProgressRing';
import { emptiesStrings } from './strings';

interface ProgressSummaryProps {
  dashboard: DashboardData;
}

export function ProgressSummary({ dashboard }: ProgressSummaryProps) {
  const { status_counts: statusCounts } = dashboard;
  const totalProducts = Object.values(statusCounts).reduce((total, count) => total + count, 0);
  const finishedCount = statusCounts.finished ?? 0;
  const percentFinished =
    totalProducts === 0 ? 0 : Math.round((finishedCount / totalProducts) * 100);

  return (
    <View className="mb-8 rounded-3xl bg-card-surface p-5 shadow-sm">
      <Text className="text-2xl font-caslon-bold text-dark-neutral">
        {emptiesStrings.progressTitle}
      </Text>
      <View className="mt-5 flex-row items-center gap-5">
        <ProgressRing
          percent={percentFinished}
          size={112}
          label={emptiesStrings.progressRingLabel(percentFinished)}
        />
        <View className="flex-1">
          <Text className="text-base font-satoshi-bold text-dark-neutral">
            {emptiesStrings.progressFinishedCount(finishedCount)}
          </Text>
          <Text className="mt-2 text-sm font-satoshi text-muted-text">
            {emptiesStrings.progressStreak(dashboard.streak.current_streak)}
          </Text>
        </View>
      </View>
    </View>
  );
}
