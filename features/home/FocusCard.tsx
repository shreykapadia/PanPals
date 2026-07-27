import React from 'react';
import { Text, View } from 'react-native';
import { ProgressRing } from '../../components/ProgressRing';
import { Product } from '../../mocks/types';
import { homeStrings } from './strings';

interface FocusCardProps {
  product: Product;
}

export function FocusCard({ product }: FocusCardProps) {
  const percent = product.percent_remaining;

  return (
    <View className="mr-3 w-32 items-center rounded-3xl border border-border-warm bg-card-surface p-4">
      <ProgressRing
        percent={percent}
        size={72}
        label={homeStrings.focusRingLabel(percent)}
        accessibilityLabel={homeStrings.focusRingAccessibilityLabel(
          product.brand,
          product.name,
          percent,
        )}
      />
      <Text
        numberOfLines={1}
        className="mt-3 text-xs font-satoshi-bold text-dark-neutral text-center"
      >
        {product.brand}
      </Text>
      <Text numberOfLines={1} className="text-xs font-satoshi text-muted-text text-center">
        {product.name}
      </Text>
    </View>
  );
}
