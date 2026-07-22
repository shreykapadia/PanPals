import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/ui/EmptyState';

// PLACEHOLDER — owned by Joon, do not build here.
export default function WishlistTab() {
  return (
    <SafeAreaView className="flex-1 bg-surface">
      <EmptyState
        title="Wishlist"
        message="This is a placeholder for your cooling-off wishlist and impulse buy intercepts."
        icon="wishlist"
        accessibilityLabel="Wishlist placeholder screen"
      />
    </SafeAreaView>
  );
}
