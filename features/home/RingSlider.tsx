import React from 'react';
import { Product } from '../../mocks/types';
import { UsageLogSheet } from '../inventory/components/UsageLogSheet';

export { snapToStep } from '../inventory/components/UsageLogSheet';
export const SLIDER_STEP = 5;

interface RingSliderProps {
  product: Product;
  onConfirm: (percent: number, note?: string) => void;
  onCancel: () => void;
  isSaving?: boolean;
  errorMessage?: string;
}

/**
 * Focus Pot usage logging wrapper: delegates to the standardized UsageLogSheet
 * so usage logging is 100% unified across Home Focus Pot and Inventory.
 */
export function RingSlider({
  product,
  onConfirm,
  onCancel,
  isSaving,
  errorMessage,
}: RingSliderProps) {
  return (
    <UsageLogSheet
      item={product}
      onClose={onCancel}
      onSave={async ({ percentAfter, note }) => {
        if (note) {
          onConfirm(percentAfter, note);
        } else {
          onConfirm(percentAfter);
        }
      }}
      isSaving={!!isSaving}
      errorMessage={errorMessage}
    />
  );
}
