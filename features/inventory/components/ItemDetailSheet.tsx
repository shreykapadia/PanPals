import React, { useState } from 'react';
import { Modal, View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Icon } from '../../../components/ui/Icon';
import { RingMark } from '../../../components/ui/RingMark';
import { colors } from '../../../theme/tokens';
import { Product } from '../../../mocks/types';
import { CATEGORY_LABELS, FORMAT_LABELS, STATUS_LABELS, inventoryStrings } from '../strings';
import { daysSinceOpened } from '../utils/daysSinceOpened';

interface ItemDetailSheetProps {
  item: Product | null;
  onClose: () => void;
  onOpenUsageLog: (item: Product) => void;
  onTogglePriority: (item: Product) => Promise<unknown>;
  isTogglingPriority: boolean;
}

/**
 * "Mark as Finished" only navigates to Talbia's Progress tab (features/empties/*)
 * — it never renders her finish flow directly (AI-CONTEXT §3 "Finish seam").
 * `finishProductId` is a plain route param; progress.tsx doesn't read it yet
 * (it currently only opens FinishFlow from its own __DEV__ preview buttons) —
 * see the CROSS-LANE REQUEST for wiring it up on her side.
 */
export const ItemDetailSheet: React.FC<ItemDetailSheetProps> = ({
  item,
  onClose,
  onOpenUsageLog,
  onTogglePriority,
  isTogglingPriority,
}) => {
  const s = inventoryStrings.detailSheet;
  const c = inventoryStrings.card;
  const router = useRouter();
  const [focusError, setFocusError] = useState<string | undefined>();

  if (!item) return null;

  const handleToggleFocus = async () => {
    setFocusError(undefined);
    try {
      await onTogglePriority(item);
    } catch {
      setFocusError(s.errorFocusFull);
    }
  };

  const handleFinish = () => {
    router.push({ pathname: '/(tabs)/progress', params: { finishProductId: item.id } });
    onClose();
  };

  const timeLabel = item.opened_at
    ? c.daysSinceOpened(daysSinceOpened(item.opened_at))
    : c.notOpenedYet;

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-surface">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border-warm">
          <Text
            className="text-lg font-bold font-caslon text-dark-neutral flex-1 pr-3"
            numberOfLines={1}
          >
            {item.brand} · {item.name}
          </Text>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={s.close}
            hitSlop={8}
            className="min-w-[44px] min-h-[44px] items-center justify-center"
          >
            <Icon name="close" size={22} color={colors['inactive-gray']} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          <View className="items-center my-4">
            <RingMark percent={item.percent_remaining} size={120} strokeWidth={12}>
              <Text className="text-2xl font-bold font-caslon text-dark-neutral">
                {item.percent_remaining}%
              </Text>
            </RingMark>
          </View>

          <View className="flex-row flex-wrap items-center justify-center gap-2 mb-4">
            <Badge label={STATUS_LABELS[item.status]} />
            <Badge label={CATEGORY_LABELS[item.category]} />
            <Badge label={FORMAT_LABELS[item.format]} />
            {item.is_priority && <Badge label={c.focusLabel} variant="success" />}
          </View>

          {item.shade && (
            <Text className="text-sm font-satoshi text-muted-text text-center mb-1">
              {item.shade}
            </Text>
          )}
          <Text className="text-sm font-satoshi text-muted-text text-center mb-6">
            {timeLabel}
            {item.pao_months ? ` · PAO ${item.pao_months}M` : ''}
          </Text>

          {focusError && (
            <Text
              accessibilityRole="alert"
              className="text-xs text-error font-satoshi text-center mb-3"
            >
              {focusError}
            </Text>
          )}

          <Button
            label={item.is_priority ? c.unpin : c.pin}
            onPress={handleToggleFocus}
            variant="secondary"
            loading={isTogglingPriority}
            accessibilityLabel={item.is_priority ? c.unpin : c.pin}
            className="mb-3"
          />

          <Button
            label={s.logUsageAction}
            onPress={() => onOpenUsageLog(item)}
            accessibilityLabel={s.logUsageAction}
            className="mb-3"
          />

          {item.status !== 'finished' && (
            <Button
              label={s.finishAction}
              onPress={handleFinish}
              variant="secondary"
              accessibilityLabel={s.finishAction}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};
