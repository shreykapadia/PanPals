import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '../../components/ui/Icon';
import { WishlistItem } from '../../mocks/types';
import { homeStrings } from './strings';

interface ReconsiderNudgeProps {
  item: WishlistItem;
}

export function ReconsiderNudge({ item }: ReconsiderNudgeProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push('/(tabs)/wishlist')}
      accessibilityRole="button"
      accessibilityLabel={homeStrings.reconsiderAccessibilityLabel(item.brand, item.name)}
      className="mb-8 flex-row items-center rounded-3xl border border-border-warm bg-warning-peach p-4"
    >
      <View className="flex-1">
        <Text className="text-base font-satoshi-bold text-dark-neutral">
          {homeStrings.reconsiderTitle}
        </Text>
        <Text className="mt-1 text-xs font-satoshi text-on-primary-container">
          {homeStrings.reconsiderMessage(item.brand, item.name)}
        </Text>
      </View>
      <Icon name="chevron-right" size={20} />
    </Pressable>
  );
}
