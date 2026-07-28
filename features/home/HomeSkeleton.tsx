import React from 'react';
import { View } from 'react-native';
import { homeStrings } from './strings';

function SkeletonBlock({ className }: { className: string }) {
  return <View className={`rounded-2xl bg-surface-container-high ${className}`} />;
}

export function HomeSkeleton() {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={homeStrings.loadingAccessibilityLabel}
      className="flex-1 bg-surface px-4 pt-6"
    >
      <SkeletonBlock className="mb-6 h-5 w-32" />
      <View className="mb-8 flex-row">
        <SkeletonBlock className="mr-3 h-40 w-32" />
        <SkeletonBlock className="mr-3 h-40 w-32" />
        <SkeletonBlock className="h-40 w-32" />
      </View>
      <SkeletonBlock className="mb-8 h-24 w-full" />
      <SkeletonBlock className="mb-8 h-16 w-full rounded-full" />
      <SkeletonBlock className="h-28 w-full" />
    </View>
  );
}
