import React from 'react';
import { LoadingState } from '../../components/ui/LoadingState';
import { emptiesStrings } from './strings';

export function EmptiesLoadingState() {
  return (
    <LoadingState
      message={emptiesStrings.loadingArchive}
      accessibilityLabel={emptiesStrings.loadingArchiveAccessibilityLabel}
    />
  );
}
