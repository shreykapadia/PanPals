import React from 'react';
import { EmptyState } from '../../components/ui/EmptyState';
import { emptiesStrings } from './strings';

export function EmptiesEmptyState() {
  return (
    <EmptyState
      title={emptiesStrings.noEmptiesTitle}
      message={emptiesStrings.noEmptiesMessage}
      icon="progress"
      accessibilityLabel={emptiesStrings.emptyStateAccessibilityLabel}
    />
  );
}
