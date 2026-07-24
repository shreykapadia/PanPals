import React from 'react';
import { Image, Text, View } from 'react-native';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Empty, Product } from '../../mocks/types';
import { emptiesStrings } from './strings';

interface EmptyCardProps {
  empty: Empty;
  product?: Product;
}

export function EmptyCard({ empty, product }: EmptyCardProps) {
  const brand = product?.brand ?? emptiesStrings.fallbackProductName;
  const name = product?.name ?? emptiesStrings.fallbackProductName;
  const photoUrl = empty.photo_url ?? product?.photo_url;
  const verdict = emptiesStrings.repurchaseVerdicts[empty.repurchase];

  return (
    <View
      accessibilityLabel={emptiesStrings.cardAccessibilityLabel(brand, name, verdict)}
      className="mb-4"
    >
      <Card className="rounded-3xl">
        <View className="flex-row">
          {photoUrl ? (
            <Image
              source={{ uri: photoUrl }}
              accessibilityLabel={`${brand} ${name}`}
              className="mr-4 h-20 w-20 rounded-2xl bg-surface-container"
            />
          ) : (
            <View className="mr-4 h-20 w-20 items-center justify-center rounded-2xl bg-surface-container">
              <Text className="text-lg font-satoshi-bold text-dark-neutral">
                {brand.slice(0, 1)}
              </Text>
            </View>
          )}
          <View className="flex-1">
            <Text className="text-xs font-satoshi text-muted-text" numberOfLines={1}>
              {brand}
            </Text>
            <Text className="mt-1 text-base font-satoshi-bold text-dark-neutral" numberOfLines={2}>
              {name}
            </Text>
            <View className="mt-3 flex-row flex-wrap gap-2">
              {empty.months_in_use !== null ? (
                <Badge label={emptiesStrings.monthsInUse(empty.months_in_use)} />
              ) : null}
              <Badge label={`${emptiesStrings.repurchaseLabel}: ${verdict}`} variant="success" />
            </View>
          </View>
        </View>
        {empty.review_text ? (
          <Text className="mt-4 text-sm leading-5 font-satoshi text-muted-text">
            {empty.review_text}
          </Text>
        ) : null}
      </Card>
    </View>
  );
}
