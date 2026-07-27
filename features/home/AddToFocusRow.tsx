import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { colors } from '../../theme/tokens';
import { Product } from '../../mocks/types';
import { homeStrings } from './strings';

interface AddToFocusRowProps {
  products: Product[];
  isFull: boolean;
  hasAnyProducts: boolean;
  onPin: (productId: string) => void;
}

export function AddToFocusRow({ products, isFull, hasAnyProducts, onPin }: AddToFocusRowProps) {
  return (
    <View className="mb-8">
      <Text className="mb-3 text-lg font-caslon-bold text-dark-neutral">
        {homeStrings.addToFocusTitle}
      </Text>
      {isFull ? (
        <Text
          accessibilityLabel={homeStrings.focusPotFullAccessibilityLabel}
          className="text-xs font-satoshi text-muted-text"
        >
          {homeStrings.focusPotFullMessage}
        </Text>
      ) : products.length === 0 ? (
        <Text className="text-xs font-satoshi text-muted-text">
          {hasAnyProducts
            ? homeStrings.addToFocusEmptyMessage
            : homeStrings.addToFocusNoProductsMessage}
        </Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {products.map((product) => (
            <Pressable
              key={product.id}
              onPress={() => onPin(product.id)}
              accessibilityRole="button"
              accessibilityLabel={homeStrings.pinAccessibilityLabel(product.brand, product.name)}
              className="mr-3 min-h-[44px] flex-row items-center gap-2 rounded-full border border-border-warm bg-card-surface px-4 py-2"
            >
              <Plus size={16} color={colors['inactive-gray']} strokeWidth={2} />
              <Text
                numberOfLines={1}
                className="max-w-[140px] text-xs font-satoshi-bold text-dark-neutral"
              >
                {product.brand} {product.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
