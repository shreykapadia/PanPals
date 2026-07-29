import React from 'react';
import { useRouter } from 'expo-router';
import { EmptyState } from '../../components/ui/EmptyState';
import { emptiesStrings } from './strings';

interface EmptiesEmptyStateProps {
  onAction?: () => void;
}

export function EmptiesEmptyState({ onAction }: EmptiesEmptyStateProps) {
  const router = useRouter();
  const handleAction = onAction ?? (() => router.push('/'));

  return (
    <EmptyState
      title={emptiesStrings.noEmptiesTitle}
      message={emptiesStrings.noEmptiesMessage}
      actionLabel={emptiesStrings.noEmptiesAction}
      onAction={handleAction}
      icon="empties"
      accessibilityLabel={emptiesStrings.emptyStateAccessibilityLabel}
    />
  );
}
