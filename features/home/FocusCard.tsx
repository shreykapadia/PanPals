import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { ProgressRing } from '../../components/ProgressRing';
import { colors } from '../../theme/tokens';
import { Product } from '../../mocks/types';
import { homeStrings } from './strings';

interface FocusCardProps {
  product: Product;
  onPressRing: (product: Product) => void;
  onUnpin: (productId: string) => void;
}

export function FocusCard({ product, onPressRing, onUnpin }: FocusCardProps) {
  const percent = product.percent_remaining;

  return (
    <View className="mr-3 w-32 items-center rounded-3xl border border-border-warm bg-card-surface p-4">
      <Pressable
        onPress={() => onUnpin(product.id)}
        accessibilityRole="button"
        accessibilityLabel={homeStrings.unpinAccessibilityLabel(product.brand, product.name)}
        className="mb-1 ml-auto min-h-[32px] min-w-[32px] items-center justify-center self-end rounded-full"
      >
        <X size={16} color={colors['inactive-gray']} strokeWidth={2} />
      </Pressable>
      <Pressable
        onPress={() => onPressRing(product)}
        accessibilityRole="button"
        accessibilityLabel={homeStrings.logRingAccessibilityLabel(product.brand, product.name)}
      >
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
      </Pressable>
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
