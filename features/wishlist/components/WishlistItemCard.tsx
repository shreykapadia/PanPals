import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Icon } from '../../../components/ui/Icon';
import { colors } from '../../../theme/tokens';
import { WishlistItem } from '../../../mocks/types';
import { CATEGORY_LABELS, PRIORITY_LABELS, STATUS_LABELS, wishlistStrings } from '../strings';
import { daysOnList } from '../utils/daysOnList';

interface WishlistItemCardProps {
  item: WishlistItem;
  onPress: () => void;
  onRemove: () => void;
  /** Wired up in Phase 1b (F5 intercept) — omitted until then. */
  similarOwnedCount?: number;
}

export const WishlistItemCard: React.FC<WishlistItemCardProps> = ({
  item,
  onPress,
  onRemove,
  similarOwnedCount,
}) => {
  const days = daysOnList(item.created_at);
  const subtitle = [CATEGORY_LABELS[item.category], item.shade].filter(Boolean).join(' · ');
  const label = `${item.brand} ${item.name}${item.shade ? `, ${item.shade}` : ''}, ${PRIORITY_LABELS[item.priority]}, ${wishlistStrings.card.daysOnList(days)}`;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={wishlistStrings.card.editAction}
    >
      <Card className="mb-3">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text
              className="text-base font-semibold font-satoshi text-dark-neutral"
              numberOfLines={1}
            >
              {item.brand} · {item.name}
            </Text>
            {subtitle.length > 0 && (
              <Text className="text-xs font-satoshi text-muted-text mt-1" numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
          <Pressable
            onPress={onRemove}
            accessibilityRole="button"
            accessibilityLabel={`${wishlistStrings.card.removeAction}: ${item.brand} ${item.name}`}
            hitSlop={8}
            className="min-w-[44px] min-h-[44px] items-center justify-center"
          >
            <Icon name="close" size={18} color={colors['inactive-gray']} />
          </Pressable>
        </View>

        <View className="flex-row flex-wrap items-center gap-2 mt-3">
          <Badge label={PRIORITY_LABELS[item.priority]} />
          <Badge label={STATUS_LABELS[item.status]} />
          {typeof similarOwnedCount === 'number' && similarOwnedCount > 0 && (
            <Badge label={`${similarOwnedCount} similar owned`} />
          )}
        </View>

        <Text className="text-xs font-satoshi text-muted-text mt-2">
          {wishlistStrings.card.daysOnList(days)}
        </Text>
      </Card>
    </Pressable>
  );
};
