import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/ui/EmptyState';

// PLACEHOLDER — owned by Aaron, do not build here.
export default function HomeTab() {
  return (
    <SafeAreaView className="flex-1 bg-surface">
      <EmptyState
        title="Home Dashboard"
        message="This is a placeholder for the Home dashboard where you track your depletion progress."
        icon="home"
        accessibilityLabel="Home Dashboard placeholder screen"
      />
    </SafeAreaView>
  );
}
