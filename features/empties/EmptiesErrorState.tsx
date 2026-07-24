import React from 'react';
import { ErrorState } from '../../components/ui/ErrorState';
import { emptiesStrings } from './strings';

interface EmptiesErrorStateProps {
  onRetry?: () => void;
}

export function EmptiesErrorState({ onRetry }: EmptiesErrorStateProps) {
  return (
    <ErrorState
      title={emptiesStrings.archiveErrorTitle}
      message={emptiesStrings.archiveErrorMessage}
      onRetry={onRetry}
      accessibilityLabel={emptiesStrings.archiveErrorAccessibilityLabel}
    />
  );
}
