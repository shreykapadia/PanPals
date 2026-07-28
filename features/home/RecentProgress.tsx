import React from 'react';
import { Text, View } from 'react-native';
import { homeStrings } from './strings';

export function RecentProgress() {
  return (
    <View className="mb-8">
      <Text className="mb-3 text-lg font-caslon-bold text-dark-neutral">
        {homeStrings.recentProgressTitle}
      </Text>
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
    </View>
  );
}
