import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/ui/EmptyState';

// PLACEHOLDER — owned by Talbia, do not build here.
export default function ProgressTab() {
  return (
    <SafeAreaView className="flex-1 bg-surface">
      <EmptyState
        title="My Progress"
        message="This is a placeholder for your finish celebrations and private empties archive."
        icon="progress"
        accessibilityLabel="Progress placeholder screen"
      />
    </SafeAreaView>
  );
}
