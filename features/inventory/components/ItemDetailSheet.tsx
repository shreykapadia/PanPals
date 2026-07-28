import React, { useState } from 'react';
import { Alert, Modal, View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Icon } from '../../../components/ui/Icon';
import { RingMark } from '../../../components/ui/RingMark';
import { colors } from '../../../theme/tokens';
import { Product } from '../../../mocks/types';
import { useUsageLogs } from '../../../lib/api';
import { CATEGORY_LABELS, FORMAT_LABELS, STATUS_LABELS, inventoryStrings } from '../strings';
import { daysSinceOpened } from '../utils/daysSinceOpened';

interface ItemDetailSheetProps {
  item: Product | null;
  onClose: () => void;
  onOpenUsageLog: (item: Product) => void;
  onOpenEdit: (item: Product) => void;
  onTogglePriority: (item: Product) => Promise<unknown>;
  isTogglingPriority: boolean;
  onDelete: (item: Product) => Promise<unknown>;
  isDeleting: boolean;
}

/**
 * "Mark as Finished" only navigates to Talbia's Empties tab (features/empties/*)
 * — it never renders her finish flow directly (AI-CONTEXT §3 "Finish seam").
 * `app/(tabs)/empties.tsx` reads `finishProductId` via useLocalSearchParams and
 * opens FinishFlow with it (Phase 5 step 2, PR #39/#40). `/(tabs)/progress` is
 * now only a temporary redirect shim Talbia deletes once this points here —
 * do not point back at it.
 */
export const ItemDetailSheet: React.FC<ItemDetailSheetProps> = ({
  item,
  onClose,
  onOpenUsageLog,
  onOpenEdit,
  onTogglePriority,
  isTogglingPriority,
  onDelete,
  isDeleting,
}) => {
  const s = inventoryStrings.detailSheet;
  const c = inventoryStrings.card;
  const h = inventoryStrings.history;
  const router = useRouter();
  const [focusError, setFocusError] = useState<string | undefined>();
  const [deleteError, setDeleteError] = useState<string | undefined>();

  // Hooks must run unconditionally — item may be null on the render right
  // after the sheet closes, so useUsageLogs(undefined) is a harmless no-op.
  const usageLogsQuery = useUsageLogs(item?.id);

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
    router.push({ pathname: '/(tabs)/empties', params: { finishProductId: item.id } });
    onClose();
  };

  const handleDelete = () => {
    Alert.alert(s.deleteConfirmTitle, s.deleteConfirmMessage(`${item.brand} ${item.name}`), [
      { text: s.deleteConfirmCancel, style: 'cancel' },
      {
        text: s.deleteConfirmConfirm,
        style: 'destructive',
        onPress: async () => {
          setDeleteError(undefined);
          try {
            await onDelete(item);
            onClose();
          } catch {
            setDeleteError(s.errorDelete);
          }
        },
      },
    ]);
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
            onPress={() => onOpenEdit(item)}
            accessibilityRole="button"
            accessibilityLabel={s.editAction}
            hitSlop={8}
            className="min-w-[44px] min-h-[44px] items-center justify-center mr-1"
          >
            <Text className="text-sm font-semibold font-satoshi text-primary">{s.editAction}</Text>
          </Pressable>
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
              className="mb-3"
            />
          )}

          {deleteError && (
            <Text
              accessibilityRole="alert"
              className="text-xs text-error font-satoshi text-center mb-3"
            >
              {deleteError}
            </Text>
          )}

          <Pressable
            onPress={handleDelete}
            disabled={isDeleting}
            accessibilityRole="button"
            accessibilityLabel={s.deleteAction}
            accessibilityState={{ disabled: isDeleting }}
            hitSlop={8}
            className="items-center justify-center py-3 mb-2"
          >
            {isDeleting ? (
              <ActivityIndicator color={colors.error} size="small" />
            ) : (
              <Text className="text-sm font-semibold font-satoshi text-error">
                {s.deleteAction}
              </Text>
            )}
          </Pressable>

          <View className="mt-4 pt-4 border-t border-border-warm">
            <Text className="text-base font-semibold font-caslon text-dark-neutral mb-3">
              {h.title}
            </Text>

            {usageLogsQuery.isLoading && (
              <ActivityIndicator color={colors['primary-container']} size="small" />
            )}

            {usageLogsQuery.isError && (
              <Text className="text-sm font-satoshi text-error">{h.errorMessage}</Text>
            )}

            {!usageLogsQuery.isLoading &&
              !usageLogsQuery.isError &&
              (usageLogsQuery.data?.length ?? 0) === 0 && (
                <View
                  accessibilityLabel={`${h.emptyTitle}. ${h.emptyMessage}`}
                  className="rounded-2xl border border-border-warm bg-card-surface p-4"
                >
                  <Text className="text-sm font-semibold font-satoshi text-dark-neutral">
                    {h.emptyTitle}
                  </Text>
                  <Text className="text-xs font-satoshi text-muted-text mt-1">
                    {h.emptyMessage}
                  </Text>
                </View>
              )}

            {!usageLogsQuery.isLoading &&
              !usageLogsQuery.isError &&
              (usageLogsQuery.data?.length ?? 0) > 0 && (
                <View className="rounded-2xl border border-border-warm bg-card-surface overflow-hidden">
                  {usageLogsQuery.data!.map((log, index) => (
                    <View
                      key={log.id}
                      className={`flex-row items-center justify-between p-3 ${
                        index > 0 ? 'border-t border-border-warm' : ''
                      }`}
                      accessibilityLabel={`${log.percent_after}% remaining, ${h.entryWhen(
                        daysSinceOpened(log.logged_at),
                      )}${log.note ? `, ${log.note}` : ''}`}
                    >
                      <View className="flex-1 pr-3">
                        <Text className="text-xs font-satoshi text-muted-text">
                          {h.entryWhen(daysSinceOpened(log.logged_at))}
                        </Text>
                        {log.note && (
                          <Text
                            className="text-sm font-satoshi text-dark-neutral mt-1"
                            numberOfLines={2}
                          >
                            {log.note}
                          </Text>
                        )}
                      </View>
                      <Text className="text-sm font-semibold font-satoshi text-dark-neutral">
                        {log.percent_after}%
                      </Text>
                    </View>
                  ))}
                </View>
              )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};
