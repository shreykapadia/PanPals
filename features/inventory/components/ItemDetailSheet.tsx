import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
  initialWindowMetrics,
} from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Icon } from '../../../components/ui/Icon';
import { Input } from '../../../components/ui/Input';
import { RingMark } from '../../../components/ui/RingMark';
import { useUsageLogs } from '../../../lib/api';
import { Product } from '../../../mocks/types';
import { colors } from '../../../theme/tokens';
import { CATEGORY_LABELS, FORMAT_LABELS, STATUS_LABELS, inventoryStrings } from '../strings';
import { daysSinceOpened } from '../utils/daysSinceOpened';

const STEP = 5;
const THUMB_SIZE = 24;

export function snapToStep(percent: number): number {
  return Math.min(100, Math.max(0, Math.round(percent / STEP) * STEP));
}

const DEFAULT_METRICS = {
  frame: { x: 0, y: 0, width: 393, height: 852 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

interface ItemDetailSheetProps {
  item: Product | null;
  onClose: () => void;
  onOpenUsageLog: (item: Product) => void;
  onOpenEdit: (item: Product) => void;
  onTogglePriority: (item: Product) => Promise<unknown>;
  isTogglingPriority: boolean;
  onDelete: (item: Product) => Promise<unknown>;
  isDeleting: boolean;
  onSaveUsageLog?: (args: { percentAfter: number; note?: string }) => Promise<unknown>;
  isLoggingUsage?: boolean;
}

/**
 * Product detail page modal (PRD §F2, PERSONAS):
 * Features inline usage logging directly on the product detail page
 * so users (Claire/Maya) can adjust the percent slider & steppers, type an optional note,
 * and save their update without any extra modal sheet transitions.
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
  onSaveUsageLog,
  isLoggingUsage,
}) => {
  const s = inventoryStrings.detailSheet;
  const c = inventoryStrings.card;
  const h = inventoryStrings.history;
  const u = inventoryStrings.usageSheet;
  const router = useRouter();

  const [focusError, setFocusError] = useState<string | undefined>();
  const [deleteError, setDeleteError] = useState<string | undefined>();
  const [saveError, setSaveError] = useState<string | undefined>();
  const [isSavingInline, setIsSavingInline] = useState(false);

  const initialPercent = snapToStep(item?.percent_remaining ?? 100);
  const [percent, setPercentState] = useState(initialPercent);
  const [note, setNote] = useState('');

  const percentRef = useRef(initialPercent);
  const dragStartPercentRef = useRef(initialPercent);
  const trackWidthRef = useRef(0);

  function updatePercent(next: number) {
    const clamped = snapToStep(next);
    percentRef.current = clamped;
    setPercentState(clamped);
  }

  useEffect(() => {
    if (item) {
      const p = snapToStep(item.percent_remaining);
      percentRef.current = p;
      setPercentState(p);
      setNote('');
      setSaveError(undefined);
      setFocusError(undefined);
      setDeleteError(undefined);
    }
  }, [item]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragStartPercentRef.current = percentRef.current;
      },
      onPanResponderMove: (_event, gestureState) => {
        if (trackWidthRef.current === 0) return;
        const deltaPercent = (gestureState.dx / trackWidthRef.current) * 100;
        updatePercent(dragStartPercentRef.current + deltaPercent);
      },
    }),
  ).current;

  // Hooks must run unconditionally — item may be null on the render right after sheet closes.
  const usageLogsQuery = useUsageLogs(item?.id);

  if (!item) return null;

  const handleToggleFocus = async () => {
    setFocusError(undefined);
    if (item.status === 'finished') {
      setFocusError('A finished product cannot be added to the Focus Pot.');
      return;
    }
    try {
      await onTogglePriority(item);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err ?? '');
      if (msg.toLowerCase().includes('finished')) {
        setFocusError('A finished product cannot be added to the Focus Pot.');
      } else {
        setFocusError(s.errorFocusFull);
      }
    }
  };

  const handleFinish = async () => {
    try {
      if (onSaveUsageLog) {
        await onSaveUsageLog({ percentAfter: 0 });
      }
    } catch {
      // Continue navigation even if logUsage has already logged
    }
    router.push({ pathname: '/(tabs)/empties', params: { finishProductId: item.id } });
    onClose();
  };

  const handleSaveInlineUsage = async () => {
    setSaveError(undefined);
    setIsSavingInline(true);
    try {
      if (onSaveUsageLog) {
        await onSaveUsageLog({ percentAfter: percent, note: note.trim() || undefined });
        setNote('');
      } else {
        onOpenUsageLog(item);
      }
    } catch {
      setSaveError(u.errorSave);
    } finally {
      setIsSavingInline(false);
    }
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

  const isSaving = isLoggingUsage || isSavingInline;

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics ?? DEFAULT_METRICS}>
        <SafeAreaView className="flex-1 bg-surface">
          <View className="flex-row items-center justify-between border-b border-border-warm px-4 py-3">
            <Text
              className="flex-1 font-caslon text-lg font-bold text-dark-neutral pr-3"
              numberOfLines={1}
            >
              {item.brand} · {item.name}
            </Text>
            <Pressable
              onPress={() => {
                onClose();
                onOpenEdit(item);
              }}
              accessibilityRole="button"
              accessibilityLabel={s.editAction}
              hitSlop={8}
              className="mr-1 min-h-[44px] min-w-[44px] items-center justify-center"
            >
              <Text className="font-satoshi text-sm font-semibold text-primary">
                {s.editAction}
              </Text>
            </Pressable>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={s.close}
              hitSlop={8}
              className="min-h-[44px] min-w-[44px] items-center justify-center"
            >
              <Icon name="close" size={22} color={colors['inactive-gray']} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
            <View className="my-4 items-center">
              <RingMark percent={item.percent_remaining} size={120} strokeWidth={12}>
                <Text className="font-caslon text-2xl font-bold text-dark-neutral">
                  {item.percent_remaining}%
                </Text>
              </RingMark>
            </View>

            <View className="mb-4 flex-row flex-wrap items-center justify-center gap-2">
              <Badge label={STATUS_LABELS[item.status]} />
              <Badge label={CATEGORY_LABELS[item.category]} />
              <Badge label={FORMAT_LABELS[item.format]} />
              {item.is_priority && <Badge label={c.focusLabel} variant="success" />}
            </View>

            {item.shade && (
              <Text className="mb-1 text-center font-satoshi text-sm text-muted-text">
                {item.shade}
              </Text>
            )}
            <Text className="mb-6 text-center font-satoshi text-sm text-muted-text">
              {timeLabel}
              {item.pao_months ? ` · PAO ${item.pao_months}M` : ''}
            </Text>

            {/* Inline Usage Logging Section directly on the product detail page */}
            {item.status !== 'finished' && (
              <View className="mb-6 rounded-2xl border border-border-warm bg-card-surface p-4">
                <Text className="mb-3 text-center font-satoshi text-xs font-semibold uppercase tracking-wider text-dark-neutral">
                  Log usage
                </Text>

                <View className="mb-3 flex-row items-center justify-center gap-6">
                  <Pressable
                    onPress={() => updatePercent(percent - STEP)}
                    accessibilityRole="button"
                    accessibilityLabel="Decrease by 5 percent"
                    className="h-11 w-11 items-center justify-center rounded-full border border-border-warm bg-surface"
                  >
                    <Text className="font-satoshi-medium text-lg text-dark-neutral">–</Text>
                  </Pressable>

                  <Text
                    className="min-w-[72px] text-center font-caslon text-3xl font-bold text-dark-neutral"
                    accessibilityLabel={`${percent}% remaining`}
                  >
                    {percent}%
                  </Text>

                  <Pressable
                    onPress={() => updatePercent(percent + STEP)}
                    accessibilityRole="button"
                    accessibilityLabel="Increase by 5 percent"
                    className="h-11 w-11 items-center justify-center rounded-full border border-border-warm bg-surface"
                  >
                    <Text className="font-satoshi-medium text-lg text-dark-neutral">+</Text>
                  </Pressable>
                </View>

                <View
                  className="relative mb-4 h-3 justify-center rounded-full bg-border-warm"
                  onLayout={(event) => {
                    trackWidthRef.current = event.nativeEvent.layout.width;
                  }}
                  accessibilityRole="adjustable"
                  accessibilityLabel={`${percent}% remaining`}
                  accessibilityValue={{ min: 0, max: 100, now: percent }}
                >
                  <View
                    style={{ width: `${percent}%` }}
                    className="absolute left-0 h-3 rounded-full bg-primary-container"
                  />
                  <View
                    {...panResponder.panHandlers}
                    style={{
                      position: 'absolute',
                      left: `${percent}%`,
                      marginLeft: -THUMB_SIZE / 2,
                      width: THUMB_SIZE,
                      height: THUMB_SIZE,
                      borderRadius: THUMB_SIZE / 2,
                      backgroundColor: colors['primary-container'],
                      borderWidth: 2,
                      borderColor: '#FFFFFF',
                    }}
                  />
                </View>

                <Input
                  label={u.noteLabel}
                  value={note}
                  onChangeText={setNote}
                  placeholder={u.notePlaceholder}
                  multiline
                  accessibilityLabel={u.noteLabel}
                />

                {saveError && (
                  <Text
                    accessibilityRole="alert"
                    className="mb-2 px-1 font-satoshi text-xs text-error"
                  >
                    {saveError}
                  </Text>
                )}

                <Button
                  label={isSaving ? u.saving : u.save}
                  onPress={handleSaveInlineUsage}
                  loading={isSaving}
                  accessibilityLabel={`Save ${percent}% remaining`}
                  className="mt-2"
                />
              </View>
            )}

            {focusError && (
              <Text
                accessibilityRole="alert"
                className="mb-3 text-center font-satoshi text-xs text-error"
              >
                {focusError}
              </Text>
            )}

            {item.status !== 'finished' && (
              <Button
                label={item.is_priority ? c.unpin : c.pin}
                onPress={handleToggleFocus}
                variant="secondary"
                loading={isTogglingPriority}
                accessibilityLabel={item.is_priority ? c.unpin : c.pin}
                className="mb-3"
              />
            )}

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
                className="mb-3 text-center font-satoshi text-xs text-error"
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
              className="mb-2 items-center justify-center py-3"
            >
              {isDeleting ? (
                <ActivityIndicator color={colors.error} size="small" />
              ) : (
                <Text className="font-satoshi text-sm font-semibold text-error">
                  {s.deleteAction}
                </Text>
              )}
            </Pressable>

            <View className="mt-4 border-t border-border-warm pt-4">
              <Text className="mb-3 font-caslon text-base font-semibold text-dark-neutral">
                {h.title}
              </Text>

              {usageLogsQuery.isLoading && (
                <ActivityIndicator color={colors['primary-container']} size="small" />
              )}

              {usageLogsQuery.isError && (
                <Text className="font-satoshi text-sm text-error">{h.errorMessage}</Text>
              )}

              {!usageLogsQuery.isLoading &&
                !usageLogsQuery.isError &&
                (usageLogsQuery.data?.length ?? 0) === 0 && (
                  <View
                    accessibilityLabel={`${h.emptyTitle}. ${h.emptyMessage}`}
                    className="rounded-2xl border border-border-warm bg-card-surface p-4"
                  >
                    <Text className="font-satoshi text-sm font-semibold text-dark-neutral">
                      {h.emptyTitle}
                    </Text>
                    <Text className="mt-1 font-satoshi text-xs text-muted-text">
                      {h.emptyMessage}
                    </Text>
                  </View>
                )}

              {!usageLogsQuery.isLoading &&
                !usageLogsQuery.isError &&
                (usageLogsQuery.data?.length ?? 0) > 0 && (
                  <View className="overflow-hidden rounded-2xl border border-border-warm bg-card-surface">
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
                          <Text className="font-satoshi text-xs text-muted-text">
                            {h.entryWhen(daysSinceOpened(log.logged_at))}
                          </Text>
                          {log.note && (
                            <Text
                              className="mt-1 font-satoshi text-sm text-dark-neutral"
                              numberOfLines={2}
                            >
                              {log.note}
                            </Text>
                          )}
                        </View>
                        <Text className="font-satoshi text-sm font-semibold text-dark-neutral">
                          {log.percent_after}%
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </Modal>
  );
};
