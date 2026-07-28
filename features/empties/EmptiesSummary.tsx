import React from 'react';
import { Text, View } from 'react-native';
import { Badge } from '../../components/ui/Badge';
import { DashboardData, RepurchaseVerdict } from '../../mocks/types';
import { ProgressRing } from './components/ProgressRing';
import { emptiesStrings } from './strings';
import { ArchiveEntry } from './useEmptiesArchive';

interface EmptiesSummaryProps {
  dashboard: DashboardData;
  entries: ArchiveEntry[];
}

export function EmptiesSummary({ dashboard, entries }: EmptiesSummaryProps) {
  const { status_counts: statusCounts } = dashboard;
  const totalProducts = Object.values(statusCounts).reduce((total, count) => total + count, 0);
  const finishedCount = statusCounts.finished ?? 0;
  const percentFinished =
    totalProducts === 0 ? 0 : Math.round((finishedCount / totalProducts) * 100);
  const verdictCounts = entries.reduce(
    (counts, { empty }) => {
      counts[empty.repurchase] += 1;
      return counts;
    },
    { yes: 0, maybe: 0, no: 0 } satisfies Record<RepurchaseVerdict, number>,
  );

  return (
    <View className="mb-8 rounded-3xl bg-card-surface p-5 shadow-sm">
      <Text className="text-2xl font-caslon-bold text-dark-neutral">
        {emptiesStrings.emptiesTitle}
      </Text>
      <View className="mt-5 flex-row items-center gap-5">
        <ProgressRing
          percent={percentFinished}
          size={112}
          label={emptiesStrings.progressRingLabel(percentFinished)}
        />
        <View className="flex-1">
          <Text className="text-base font-satoshi-bold text-dark-neutral">
            {emptiesStrings.emptiesFinishedCount(finishedCount)}
          </Text>
        </View>
      </View>
      <View
        accessibilityLabel={emptiesStrings.emptiesVerdictAccessibilityLabel(verdictCounts)}
        className="mt-5 flex-row flex-wrap gap-2"
      >
        {(['yes', 'maybe', 'no'] as const).map((verdict) => (
          <Badge
            key={verdict}
            label={emptiesStrings.emptiesVerdictCount(verdict, verdictCounts[verdict])}
          />
        ))}
      </View>
    </View>
  );
}
