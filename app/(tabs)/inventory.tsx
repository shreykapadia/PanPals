import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/ui/EmptyState';

// PLACEHOLDER — owned by Matt, do not build here.
export default function InventoryTab() {
  return (
    <SafeAreaView className="flex-1 bg-surface">
      <EmptyState
        title="Inventory"
        message="This is a placeholder for your makeup inventory where you can fast-log, browse, and edit items."
        icon="inventory"
        accessibilityLabel="Inventory placeholder screen"
      />
    </SafeAreaView>
  );
}
