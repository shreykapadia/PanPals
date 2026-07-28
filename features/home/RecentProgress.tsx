import React from 'react';
import { Text, View } from 'react-native';
import { RecentActivityEntry } from './useHomeData';
import { daysSince } from './utils/daysSince';
import { homeStrings } from './strings';

interface RecentProgressProps {
  entries: RecentActivityEntry[];
}

export function RecentProgress({ entries }: RecentProgressProps) {
  return (
    <View className="mb-8">
      <Text className="mb-3 text-lg font-caslon-bold text-dark-neutral">
        {homeStrings.recentProgressTitle}
      </Text>
      {entries.length === 0 ? (
        <View
          accessibilityLabel={homeStrings.recentProgressEmptyAccessibilityLabel}
          className="rounded-3xl border border-border-warm bg-card-surface p-4"
        >
          <Text className="text-sm font-satoshi-bold text-dark-neutral">
            {homeStrings.recentProgressEmptyTitle}
          </Text>
          <Text className="mt-1 text-xs font-satoshi text-muted-text">
            {homeStrings.recentProgressEmptyMessage}
          </Text>
        </View>
      ) : (
        <View className="rounded-3xl border border-border-warm bg-card-surface">
          {entries.map(({ log, product }, index) => {
            const when = homeStrings.recentProgressWhen(daysSince(log.logged_at));
            return (
              <View
                key={log.id}
                accessibilityLabel={homeStrings.recentProgressEntryAccessibilityLabel(
                  product.brand,
                  product.name,
                  log.percent_after,
                  when,
                )}
                className={`flex-row items-center justify-between p-4 ${
                  index > 0 ? 'border-t border-border-warm' : ''
                }`}
              >
                <View className="flex-1 pr-3">
                  <Text numberOfLines={1} className="text-sm font-satoshi-bold text-dark-neutral">
                    {product.brand} {product.name}
                  </Text>
                  <Text className="mt-1 text-xs font-satoshi text-muted-text">{when}</Text>
                </View>
                <Text className="text-sm font-satoshi-bold text-dark-neutral">
                  {log.percent_after}%
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
