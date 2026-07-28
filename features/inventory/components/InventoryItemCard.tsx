import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { RingMark } from '../../../components/ui/RingMark';
import { Product } from '../../../mocks/types';
import { CATEGORY_LABELS, STATUS_LABELS, inventoryStrings } from '../strings';
import { daysSinceOpened } from '../utils/daysSinceOpened';

interface InventoryItemCardProps {
  item: Product;
  onPress: () => void;
}

/**
 * Uses the shared `RingMark` (components/ui) rather than the not-yet-built
 * `components/ProgressRing.tsx` — that data-bearing ring is Aaron's file
 * (AI-CONTEXT §3); this card only needs a lightweight percent indicator.
 */
export const InventoryItemCard: React.FC<InventoryItemCardProps> = ({ item, onPress }) => {
  const c = inventoryStrings.card;
  const subtitle = [CATEGORY_LABELS[item.category], item.shade].filter(Boolean).join(' · ');
  const timeLabel = item.opened_at
    ? c.daysSinceOpened(daysSinceOpened(item.opened_at))
    : c.notOpenedYet;
  const label = `${item.brand} ${item.name}${item.shade ? `, ${item.shade}` : ''}, ${STATUS_LABELS[item.status]}, ${c.percentRemaining(item.percent_remaining)}${item.is_priority ? `, ${c.focusLabel}` : ''}`;

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      <Card className="mb-3 flex-row items-center">
        <RingMark percent={item.percent_remaining} size={48} strokeWidth={6}>
          <Text className="text-[10px] font-satoshi-medium text-dark-neutral">
            {item.percent_remaining}%
          </Text>
        </RingMark>

        <View className="flex-1 ml-3">
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
          <View className="flex-row flex-wrap items-center gap-2 mt-2">
            <Badge label={STATUS_LABELS[item.status]} />
            {item.is_priority && <Badge label={c.focusLabel} variant="success" />}
          </View>
          <Text className="text-xs font-satoshi text-muted-text mt-2">{timeLabel}</Text>
        </View>
      </Card>
    </Pressable>
  );
};
